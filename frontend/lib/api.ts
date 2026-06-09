import { supabase } from '@/lib/supabaseClient';
import type { AnalyticsSummary, IntentSignal, IntentType } from '@/lib/types';

export async function fetchSignals(): Promise<IntentSignal[]> {
  const { data, error } = await supabase
    .from('intent_signals')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(250);

  if (error) throw error;
  return (data ?? []) as IntentSignal[];
}

export async function triageSignal(signalId: string, payload: { intent_type: IntentType | string; urgency_score: number }) {
  const { error } = await supabase
    .from('intent_signals')
    .update({
      intent_type: payload.intent_type,
      urgency_score: payload.urgency_score,
      processing_status: 'TRIAGED',
    })
    .eq('signal_id', signalId);

  if (error) throw error;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const rows = await fetchSignals();

  const total_signals = rows.length;
  const high_urgency_count = rows.filter(r => (r.urgency_score ?? 0) >= 4).length;
  const pending_triage_count = rows.filter(r => r.processing_status === 'PENDING_MANUAL_TRIAGE').length;

  const brandCount = new Map<string, number>();
  const intent_breakdown: Record<string, number> = {
    OUT_OF_STOCK: 0,
    PRODUCT_REQUEST: 0,
    LOCATION_INQUIRY: 0,
    UNCLEAR: 0,
  };
  const urgency_breakdown: Record<string, number> = { '1':0,'2':0,'3':0,'4':0,'5':0 };
  const dayCount = new Map<string, number>();

  for (const r of rows) {
    const brand = r.ai_extracted_brand?.trim();
    if (brand) brandCount.set(brand, (brandCount.get(brand) ?? 0) + 1);
    if (r.intent_type && intent_breakdown[r.intent_type] !== undefined) intent_breakdown[r.intent_type] += 1;
    if (r.urgency_score) urgency_breakdown[String(r.urgency_score)] += 1;
    const date = new Date(r.timestamp).toISOString().slice(0,10);
    dayCount.set(date, (dayCount.get(date) ?? 0) + 1);
  }

  const top_brands = [...brandCount.entries()]
    .sort((a,b) => b[1]-a[1])
    .slice(0,10)
    .map(([brand,count]) => ({ brand, count }));

  const top_brand = top_brands[0]?.brand ?? 'None yet';

  const last14 = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().slice(0,10);
    return { date: iso, count: dayCount.get(iso) ?? 0 };
  });

  return {
    total_signals,
    high_urgency_count,
    pending_triage_count,
    top_brand,
    intent_breakdown,
    urgency_breakdown,
    top_brands,
    daily_series: last14,
  };
}
