'use client';
import { useEffect, useState } from 'react';
import { fetchAnalytics } from '@/lib/api';
import type { AnalyticsSummary } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

const INTENT_COLORS: Record<string, string> = {
  OUT_OF_STOCK:     'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  PRODUCT_REQUEST:  'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  LOCATION_INQUIRY: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  UNCLEAR:          'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      </AuthGuard>
    );
  }

  if (!data) return <AuthGuard><p className="text-stone-400 p-8">No analytics data.</p></AuthGuard>;

  const maxDay = Math.max(...data.daily_series.map((d) => d.count), 1);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Performance Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Analytics</h1>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ['Total Signals', String(data.total_signals)],
            ['High Urgency', String(data.high_urgency_count)],
            ['Pending Triage', String(data.pending_triage_count)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">{value}</p>
            </div>
          ))}
        </div>

        {/* Intent breakdown */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-200">Intent Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.intent_breakdown).map(([intent, count]) => (
              <div key={intent} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${INTENT_COLORS[intent] ?? 'bg-stone-100 text-stone-600'}`}>
                {intent.replace(/_/g, ' ')} &mdash; {count}
              </div>
            ))}
          </div>
        </div>

        {/* Urgency breakdown */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-200">Urgency Distribution</h2>
          <div className="flex items-end gap-3 h-28">
            {Object.entries(data.urgency_breakdown).map(([score, count]) => {
              const maxCount = Math.max(...Object.values(data.urgency_breakdown), 1);
              const pct = Math.round((count / maxCount) * 100);
              const barColor = Number(score) >= 4 ? 'bg-rose-500' : Number(score) >= 3 ? 'bg-amber-400' : 'bg-teal-500';
              return (
                <div key={score} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-stone-500">{count}</span>
                  <div className={`w-full rounded-t-lg ${barColor}`} style={{ height: `${pct}%`, minHeight: 4 }} />
                  <span className="text-xs text-stone-400">U{score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 14-day sparkline */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-200">Signals — Last 14 Days</h2>
          <div className="flex items-end gap-1 h-28">
            {data.daily_series.map(({ date, count }) => {
              const pct = Math.round((count / maxDay) * 100);
              return (
                <div key={date} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-sm bg-teal-500/70 hover:bg-teal-600 transition-all"
                    style={{ height: `${pct}%`, minHeight: count > 0 ? 4 : 0 }}
                  />
                  <span className="mt-1 hidden text-[10px] text-stone-400 group-hover:block absolute -bottom-5 whitespace-nowrap">
                    {date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-stone-400">
            <span>{data.daily_series[0]?.date?.slice(5)}</span>
            <span>{data.daily_series[13]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Top brands */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-200">Top Extracted Brands</h2>
          {data.top_brands.length === 0 ? (
            <p className="text-sm text-stone-400">No brand data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.top_brands.map(({ brand, count }, i) => {
                const pct = Math.round((count / (data.top_brands[0]?.count ?? 1)) * 100);
                return (
                  <div key={brand} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-semibold text-stone-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{brand}</span>
                        <span className="text-xs text-stone-400">{count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
