'use client';
import type { IntentSignal } from '@/lib/types';

function toCSV(rows: IntentSignal[]) {
  const headers = ['signal_id','timestamp','store_id','raw_input','ai_extracted_category','ai_extracted_brand','intent_type','urgency_score','processing_status'];
  const escape = (value: unknown) => {
    const str = String(value ?? '');
    return `"${str.replaceAll('"', '""')}"`;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(',')),
  ].join('\n');
}

export default function ExportButton({ rows }: { rows: IntentSignal[] }) {
  function handleExport() {
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afferent-signal-export-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
    >
      Export CSV
    </button>
  );
}
