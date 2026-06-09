'use client';
import { useEffect, useState } from 'react';
import { fetchAnalytics } from '@/lib/api';
import type { AnalyticsSummary } from '@/lib/types';

const INTENT_COLORS: Record<string,string> = {
  OUT_OF_STOCK:     '#ef4444',
  PRODUCT_REQUEST:  '#3b82f6',
  LOCATION_INQUIRY: '#f59e0b',
  UNCLEAR:          '#a8a29e',
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }}/>
      </div>
      <span className="text-xs tabular-nums text-stone-500 w-6 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then(setData).finally(() => setLoading(false));
    const id = setInterval(() => fetchAnalytics().then(setData), 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-48 w-full rounded-2xl"/>)}</div>;
  if (!data) return <p className="text-stone-400">Failed to load analytics.</p>;

  const maxIntent  = Math.max(...Object.values(data.intent_breakdown));
  const maxUrgency = Math.max(...Object.values(data.urgency_breakdown));
  const maxBrand   = data.top_brands[0]?.count ?? 1;
  const maxDay     = Math.max(...data.daily_series.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Signals',   value: data.total_signals },
          { label: 'High Urgency',    value: data.high_urgency_count },
          { label: 'Pending Triage',  value: data.pending_triage_count },
          { label: 'Top Brand',       value: data.top_brand },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-50">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Intent Breakdown</h2>
          {Object.entries(data.intent_breakdown).map(([intent, count]) => (
            <div key={intent}>
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>{intent.replace(/_/g,' ')}</span>
              </div>
              <Bar value={count} max={maxIntent} color={INTENT_COLORS[intent] ?? '#a8a29e'}/>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Urgency Distribution</h2>
          {Object.entries(data.urgency_breakdown).map(([score, count]) => (
            <div key={score}>
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Score {score}</span>
              </div>
              <Bar value={count} max={maxUrgency} color={Number(score) >= 4 ? '#ef4444' : Number(score) === 3 ? '#f59e0b' : '#01696f'}/>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Top Brands</h2>
          {data.top_brands.length === 0
            ? <p className="text-sm text-stone-400">No brand data yet.</p>
            : data.top_brands.map(({ brand, count }) => (
              <div key={brand}>
                <div className="text-xs text-stone-500 mb-1">{brand}</div>
                <Bar value={count} max={maxBrand} color="#01696f"/>
              </div>
            ))
          }
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">14-Day Signal Volume</h2>
          {data.daily_series.length === 0
            ? <p className="text-sm text-stone-400">No data yet.</p>
            : (
              <div className="flex items-end gap-1 h-32">
                {data.daily_series.map(({ date, count }) => (
                  <div key={date} className="flex flex-col items-center gap-1 flex-1" title={`${date}: ${count}`}>
                    <div className="w-full rounded-t-sm bg-teal-500/80 transition-all" style={{ height: `${(count/maxDay)*100}%`, minHeight: count > 0 ? '4px' : '0' }}/>
                    <span className="text-[10px] text-stone-400 rotate-45 origin-left whitespace-nowrap hidden sm:block">
                      {date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
