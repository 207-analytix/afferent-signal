// RULE: All backend statuses MUST pass through this map before display.
// Never render raw status strings to consumers.

export const STATUS_LABELS: Record<string, string> = {
  PENDING_MANUAL_TRIAGE: "Under review — we'll update the status soon.",
  OUT_OF_STOCK: "This item may be out of stock at your store.",
  PRODUCT_REQUEST: "Your product request is in the queue.",
  LOCATION_INQUIRY: "We're checking availability near you.",
  PENDING: "Under review",
  ACTIVE: "Being reviewed by your store",
  FULFILLED: "Great news! Now available at your store!",
  CLOSED: "Request closed",
};

export const getStatusLabel = (raw: string): string =>
  STATUS_LABELS[raw] ?? "Status updating...";

export const STATUS_PILL_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PENDING_MANUAL_TRIAGE: "bg-amber-50 text-amber-700 border border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PRODUCT_REQUEST: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  FULFILLED: "bg-blue-50 text-blue-700 border border-blue-200",
  CLOSED: "bg-slate-100 text-slate-500 border border-slate-200",
};

export const getStatusPillClass = (raw: string): string =>
  STATUS_PILL_CLASS[raw] ?? "bg-slate-100 text-slate-500 border border-slate-200";
