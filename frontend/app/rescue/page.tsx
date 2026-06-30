'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface RescueOffer {
  id: string;
  offer_type: 'alternative_product' | 'coupon' | 'delivery' | 'nearby_store';
  title: string;
  description: string;
  value_cents: number;
  deep_link: string | null;
}

export default function RescuePage() {
  const router = useRouter();
  const [offers, setOffers] = useState<RescueOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadOffers() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/onboarding'); return; }

      const { data } = await supabase
        .from('as_rescue_options')
        .select('id, offer_type, title, description, value_cents, deep_link')
        .eq('is_active', true)
        .order('value_cents', { ascending: false })
        .limit(8);

      setOffers((data as RescueOffer[]) ?? []);
      setLoading(false);
    }
    loadOffers();
  }, [router]);

  async function claimOffer(offer: RescueOffer) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('as_wallet_ledger').insert({
      user_id: session.user.id,
      amount_cents: offer.value_cents,
      event_type: 'rescue_claim',
      reference_id: offer.id,
    });
    setClaimed(prev => new Set(prev).add(offer.id));
    if (offer.deep_link) window.open(offer.deep_link, '_blank');
  }

  const offerIcon: Record<string, string> = {
    alternative_product: '🔄',
    coupon: '🏷️',
    delivery: '🚚',
    nearby_store: '🗺️',
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-4">← Back</button>
        <h1 className="text-xl font-bold">Rescue options</h1>
        <p className="text-gray-400 text-sm mt-1">Alternatives, coupons, and nearby stores for what you couldn't find.</p>
      </div>

      <div className="px-5 space-y-3">
        {loading && (
          <div className="text-center py-12 text-gray-600 text-sm">Loading rescue options…</div>
        )}
        {!loading && offers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 text-sm">No rescue options yet. Report a missing item first.</p>
            <button onClick={() => router.push('/capture')} className="mt-4 bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-semibold">Report an item</button>
          </div>
        )}
        {offers.map(offer => (
          <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{offerIcon[offer.offer_type] ?? '💡'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{offer.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{offer.description}</p>
                {offer.value_cents > 0 && (
                  <p className="text-emerald-400 text-xs font-semibold mt-1">+${(offer.value_cents / 100).toFixed(2)} reward</p>
                )}
              </div>
              <button
                onClick={() => claimOffer(offer)}
                disabled={claimed.has(offer.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  claimed.has(offer.id)
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {claimed.has(offer.id) ? 'Claimed ✓' : 'Claim'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[['🏠','Home','/home'],['📷','Capture','/capture'],['🎁','Rescue','/rescue'],['👛','Wallet','/wallet']].map(([icon, label, href]) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex-1 py-4 flex flex-col items-center gap-0.5 text-xs ${
              href === '/rescue' ? 'text-indigo-400' : 'text-gray-500'
            }`}>
            <span className="text-lg">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </main>
  );
}
