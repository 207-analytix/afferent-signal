'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchSignals } from '@/lib/api';
import type { IntentSignal } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import ExportButton from '@/components/ExportButton';

function urgencyTone(score: number | null) {
  if (!score) return 'bg-white dark:bg-stone-900';
  if (score >= 5) return 'bg-rose-50 dark:bg-rose-950/30';
  if (score >= 4) return 'bg-orange-50 dark:bg-orange-950/20';
  return 'bg-white dark:bg-stone-900';
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchSignals().then(setSignals).finally(() => setLoading(false));
    const id = setInterval(() => fetchSignals().then(setSignals), 15000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      const matchesIntent = intentFilter === 'ALL' || s.intent_type === intentFilter;
      const q = query.toLowerCase().trim();
      const matchesQuery = !q ||
        s.store_id.toLowerCase().includes(q) ||
        (s.ai_extracted_brand ?? '').toLowerCase().includes(q);
      return matchesIntent && matchesQuery;
    });
  }, [signals, intentFilter, query]);

  const total = signals.length;
  const highUrgency = signals.filter((s) => (s.urgency_score ?? 0) >= 4).length;
  const topBrand = (() => {
    const counts = new Map<string, number>();
    for (const s of signals) {
      const brand = s.ai_extracted_brand?.trim();
      if (!brand) continue;
      counts.set(brand, (counts.get(brand) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None yet';
  })();

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Realtime Retail Intel</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Signal Matrix</h1>
          </div>
          <div className="flex gap-3">
            <ExportButton rows={filtered} />
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              Refreshing every 15s
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ['Total Captured Signals', String(total)],
            ['High-Urgency Queue', String(highUrgency)],
            ['Top Extracted Brand', topBrand],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Controls</h2>
              <p className="text-xs text-stone-400">Filter by intent and search by store or brand.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-stone-700 dark:bg-stone-800"
              >
                <option value="ALL">All intents</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
                <option value="PRODUCT_REQUEST">Product request</option>
                <option value="LOCATION_INQUIRY">Location inquiry</option>
                <option value="UNCLEAR">Unclear</option>
              </select>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search store_id or brand"
                className="min-w-[260px] rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-stone-700 dark:bg-stone-800"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left dark:border-stone-800 dark:bg-stone-950/40">
                  {['Timestamp','Store','Raw Input','Category','Brand','Intent','Urgency','Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-stone-100 dark:border-stone-800">
                      <td colSpan={8} className="p-4"><div className="skeleton h-10 rounded-2xl" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-stone-400">No signals match your filters.</td>
                  </tr>
                ) : (
                  filtered.map((signal) => (
                    <tr key={signal.signal_id} className={`border-b border-stone-100 dark:border-stone-800 ${urgencyTone(signal.urgency_score)}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-stone-500">{new Date(signal.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-stone-600 dark:text-stone-300">{signal.store_id}</td>
                      <td className="max-w-[320px] px-4 py-3 text-stone-700 dark:text-stone-200">{signal.raw_input}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{signal.ai_extracted_category ?? '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{signal.ai_extracted_brand ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                          {signal.intent_type ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-100">{signal.urgency_score ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-300">{signal.processing_status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
