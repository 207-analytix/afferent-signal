'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const CATEGORIES = ['Produce','Dairy','Meat','Bakery','Frozen','Beverages','Snacks','Household','Baby','Other'];

export default function CapturePage() {
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [earnedCents, setEarnedCents] = useState(0);

  async function handleSubmit() {
    if (!itemName.trim()) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/onboarding'); return; }

    const { data, error } = await supabase
      .from('as_item_reports')
      .insert({
        user_id: session.user.id,
        item_name: itemName.trim(),
        category: category || 'Other',
        shopper_note: note.trim() || null,
        status: 'pending',
      })
      .select('reward_cents')
      .maybeSingle();

    if (!error && data) setEarnedCents((data as { reward_cents: number }).reward_cents ?? 25);
    else setEarnedCents(25); // default reward

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold">Report submitted!</h2>
        <p className="text-gray-400 mt-2 text-sm">You earned <span className="text-emerald-400 font-semibold">${(earnedCents / 100).toFixed(2)}</span> for helping other shoppers.</p>
        <div className="mt-8 space-y-3 w-full max-w-xs">
          <button onClick={() => router.push('/rescue')} className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold text-sm transition">
            See rescue options →
          </button>
          <button onClick={() => { setSubmitted(false); setItemName(''); setCategory(''); setNote(''); }}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-sm transition">
            Report another item
          </button>
          <button onClick={() => router.push('/home')} className="text-gray-500 text-xs underline">Back to home</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="px-5 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-4">← Back</button>
        <h1 className="text-xl font-bold">Report missing item</h1>
        <p className="text-gray-400 text-sm mt-1">Takes under 3 seconds. Earn rewards instantly.</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Item name */}
        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Item name *</label>
          <input
            autoFocus
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            placeholder="e.g. Oat milk, sourdough bread…"
            className="mt-1.5 w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Category</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Shelf location, brand, size…"
            rows={2}
            className="mt-1.5 w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !itemName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3.5 font-semibold text-sm transition mt-2"
        >
          {submitting ? 'Submitting…' : '📸 Submit report'}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[['🏠','Home','/home'],['📷','Capture','/capture'],['🎁','Rescue','/rescue'],['👛','Wallet','/wallet']].map(([icon, label, href]) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex-1 py-4 flex flex-col items-center gap-0.5 text-xs ${
              href === '/capture' ? 'text-indigo-400' : 'text-gray-500'
            }`}>
            <span className="text-lg">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </main>
  );
}
