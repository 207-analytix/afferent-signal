export type IntentType = 'OUT_OF_STOCK' | 'PRODUCT_REQUEST' | 'LOCATION_INQUIRY' | 'UNCLEAR';

export type IntentSignal = {
  signal_id: string;
  store_id: string;
  timestamp: string;
  raw_input: string;
  session_id: string;
  ai_extracted_category: string | null;
  ai_extracted_brand: string | null;
  ai_descriptors: string[];
  intent_type: IntentType | null;
  urgency_score: number | null;
  processing_status: string;
  created_at: string;
  updated_at: string;
};

export type AnalyticsSummary = {
  total_signals: number;
  high_urgency_count: number;
  pending_triage_count: number;
  top_brand: string;
  intent_breakdown: Record<string, number>;
  urgency_breakdown: Record<string, number>;
  top_brands: { brand: string; count: number }[];
  daily_series: { date: string; count: number }[];
};
