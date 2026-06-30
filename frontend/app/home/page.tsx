'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useGeofence, type GeofenceEvent } from '../../hooks/useGeofence';
import { usePush } from '../../hooks/usePush';

interface StoreStatus { id: string; name: string; address: string; stock_health: number; last_report_at: string; }

export default function HomePage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreStatus[]>([]);
  const [activeStore, setActiveStore] = useState<GeofenceEvent | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { status: pushStatus, requestPermission } = usePush();

  useGeofence({
    enabled: true,
    onEvent: (event) => {
      if (event.type === 'enter' || event.type === 'dwell') setActiveStore(event);
      if (event.type === 'exit') setActiveStore(null);
    },
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/onboarding'); return; }

      const { data: walletData } = await supabase
        .from('as_wallet_accounts')
        .select('balance_cents')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (walletData) setWalletBalance(walletData.balance_cents / 100);

      const { data: storeData } = await supabase
        .from('as_stores')
        .select('id, name, address, stock_health, last_report_at')
        .order('stock_health', { ascending: true })
        .limit(6);
      if (storeData) setStores(storeData as StoreStatus[]);
    }
    load();
  }, [router]);

  function healthColor(score: number) {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Good evening 👋</h1>
          <p className="text-gray-400 text-sm">Your shopping radar is active</p>
        </div>
        <button onClick={() => router.push('/wallet')} className="bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium text-emerald-400">
          ${walletBalance.toFixed(2)}
        </button>
      </div>

      {/* Active store banner */}
      {activeStore && (
        <div className="mx-5 mb-4 bg-indigo-900 border border-indigo-600 rounded-2xl p-4">
          <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">You're inside</p>
          <p className="text-lg font-bold mt-0.5">{activeStore.store_name}</p>
          <button
            onClick={() => router.push('/capture')}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-2.5 text-sm font-semibold transition"
          >
            Report a missing item →
          </button>
        </div>
      )}

      {/* Push nudge */}
      {pushStatus !== 'granted' && (
        <div className="mx-5 mb-4 bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-gray-300">Enable alerts for pre-trip warnings</p>
          <button onClick={requestPermission} className="text-indigo-400 text-sm font-semibold">Enable</button>
        </div>
      )}

      {/* Nearby stores */}
      <div className="px-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Nearby stores</h2>
        <div className="space-y-3">
          {stores.map(store => (
            <div key={store.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{store.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{store.address}</p>
                </div>
                <span className={`text-sm font-bold ${healthColor(store.stock_health)}`}>
                  {store.stock_health}%
                </span>
              </div>
              <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    store.stock_health >= 80 ? 'bg-emerald-500' :
                    store.stock_health >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${store.stock_health}%` }}
                />
              </div>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">No store data yet — walk into a store to start tracking.</p>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[['🏠','Home','/home'],['📷','Capture','/capture'],['🎁','Rescue','/rescue'],['👛','Wallet','/wallet']].map(([icon, label, href]) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex-1 py-4 flex flex-col items-center gap-0.5 text-xs ${
              href === '/home' ? 'text-indigo-400' : 'text-gray-500'
            }`}>
            <span className="text-lg">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </main>
  );
}
