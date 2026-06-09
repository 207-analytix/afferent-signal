'use client';
import { useEffect, useState, useCallback } from 'react';
import { fetchSignals, triageSignal } from '@/lib/api';
import type { IntentSignal, IntentType } from '@/lib/types';

const INTENT_OPTS: IntentType[] = ['OUT_OF_STOCK','PRODUCT_REQUEST','LOCATION_INQUIRY','UNCLEAR'];

export default function TriagePage() {
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState<IntentSignal | null>(null);
  const [form, setForm] = useState({ intent_type: 'UNCLEAR', urgency_score: 1 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchSignals();
      setSignals(all.filter(s => s.processing_status === 'PENDING_MANUAL_TRIAGE'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  function openModal(s: IntentSignal) {
    setActive(s);
    setForm({ intent_type: s.intent_type ?? 'UNCLEAR', urgency_score: s.urgency_score ?? 1 });
  }

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    try {
      await triageSignal(active.signal_id, { intent_type: form.intent_type, urgency_score: form.urgency_score });
      setActive(null);
      await load();
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Manual Triage Queue</h1>
          <p className="text-sm text-stone-400 mt-0.5">Signals the AI could not classify — assign intent and urgency.</p>
        </div>
        {!loading && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{signals.length} pending</span>}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-16 w-full rounded-2xl"/>)}</div>
      ) : signals.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
          <p className="text-sm font-medium">Queue is clear — all signals processed.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                {['Time','Store','Raw Input','Action'].map(h=>(
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map(s => (
                <tr key={s.signal_id} className="border-b last:border-0 border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="px-4 py-3 text-xs text-stone-400 tabular-nums whitespace-nowrap">
                    {new Date(s.timestamp).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{s.store_id}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-stone-700 dark:text-stone-300" title={s.raw_input}>{s.raw_input}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openModal(s)}
                      className="rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition">
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setActive(null); }}>
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-5 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="font-bold text-stone-900 dark:text-stone-50">Triage Signal</h2>
            <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-300 italic">
              "{active.raw_input}"
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Intent Type</label>
              <select value={form.intent_type} onChange={e => setForm(f => ({ ...f, intent_type: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500">
                {INTENT_OPTS.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
                Urgency Score — <span className="text-teal-600">{form.urgency_score}</span> / 5
              </label>
              <input type="range" min={1} max={5} step={1} value={form.urgency_score}
                onChange={e => setForm(f => ({ ...f, urgency_score: Number(e.target.value) }))}
                className="w-full accent-teal-600"/>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setActive(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 transition">
                {saving ? 'Saving…' : 'Save & Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
