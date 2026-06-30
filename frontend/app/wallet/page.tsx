'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface LedgerEntry {
  id: string;
  amount_cents: number;
  event_type: string;
  created_at: string;
  description: string | null;
}

const eventLabel: Record<string, string> = {
  item_report: '📋 Item report',
  rescue_claim: '🎁 Rescue claim',
  referral: '👥 Referral bonus',
  adjustment: '⚙️ Adjustment',
  redemption: '💸 Redeemed',
};

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallet() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/onboarding'); return; }

      const [walletRes, ledgerRes, reportsRes] = await Promise.all([
        supabase.from('as_wallet_accounts').select('balance_cents').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('as_wallet_ledger').select('id, amount_cents, event_type, created_at, description').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('as_item_reports').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      ]);

      if (walletRes.data) setBalance(walletRes.data.balance_cents);
      if (ledgerRes.data) setLedger(ledgerRes.data as LedgerEntry[]);
      if (reportsRes.count !== null) setReportCount(reportsRes.count);
      setLoading(false);
    }
    loadWallet();
  }, [router]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-xl font-bold">Wallet</h1>

        {/* Balance card */}
        <div className="mt-4 bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-700 rounded-2xl p-5">
          <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">Available balance</p>
          <p className="text-4xl font-bold mt-1">${(balance / 100).toFixed(2)}</p>
          <div className="mt-4 flex gap-3">
            <div className="bg-indigo-700/50 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-lg font-bold">{reportCount}</p>
              <p className="text-xs text-indigo-300">Reports</p>
            </div>
            <div className="bg-indigo-700/50 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-lg font-bold">{ledger.filter(l => l.amount_cents > 0).length}</p>
              <p className="text-xs text-indigo-300">Rewards</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/capture')}
          className="mt-3 w-full bg-emerald-700 hover:bg-emerald-600 rounded-xl py-3 text-sm font-semibold transition"
        >
          + Earn more — report an item
        </button>
      </div>

      {/* Activity */}
      <div className="px-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Activity</h2>
        {loading && <p className="text-gray-600 text-sm">Loading…</p>}
        {!loading && ledger.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">No activity yet. Submit your first report to start earning.</p>
        )}
        <div className="space-y-2">
          {ledger.map(entry => (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{eventLabel[entry.event_type] ?? entry.event_type}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.created_at)}</p>
              </div>
              <span className={`text-sm font-bold ${
                entry.amount_cents >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {entry.amount_cents >= 0 ? '+' : ''}${Math.abs(entry.amount_cents / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[['🏠','Home','/home'],['📷','Capture','/capture'],['🎁','Rescue','/rescue'],['👛','Wallet','/wallet']].map(([icon, label, href]) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex-1 py-4 flex flex-col items-center gap-0.5 text-xs ${
              href === '/wallet' ? 'text-indigo-400' : 'text-gray-500'
            }`}>
            <span className="text-lg">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </main>
  );
}
