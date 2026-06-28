"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StepFlow } from "@/components/ui/step-flow";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { label: "Product" },
  { label: "Store" },
  { label: "Submit" },
];

const DEMO_STORES = [
  { store_id: "SHAWS_04020", store_name: "Shaw's", retailer_chain: "Shaw's", zip_code: "04020" },
  { store_id: "HANNAFORD_04020", store_name: "Hannaford", retailer_chain: "Hannaford", zip_code: "04020" },
  { store_id: "DOLLAR_04020", store_name: "Dollar General", retailer_chain: "Dollar General", zip_code: "04020" },
];

export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    product_name: "",
    brand_name: "",
    upc: "",
    user_note: "",
    store_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to submit a request.");

      const { error: dbError } = await supabase.from("product_requests").insert({
        user_id: user.id,
        store_id: form.store_id || null,
        product_name: form.product_name,
        brand_name: form.brand_name || null,
        upc: form.upc || null,
        user_note: form.user_note || null,
        status: "PENDING",
      });
      if (dbError) throw dbError;

      // Also send to FastAPI ingestion pipeline
      await fetch("/api/signal-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_input: [form.product_name, form.brand_name, form.user_note].filter(Boolean).join(" "),
          store_id: form.store_id || null,
          intent_type: "PRODUCT_REQUEST",
        }),
      });

      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AppShell title="Request Sent!">
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-6">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Request submitted!</h2>
          <p className="text-slate-500 mb-8 max-w-[28ch]">
            We&apos;ve sent your request to your store. We&apos;ll let you know when it&apos;s fulfilled.
          </p>
          <a
            href="/requests"
            className="px-8 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
          >
            View My Requests
          </a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Request a Product">
      <div className="flex flex-col gap-6">

        {/* Step indicator */}
        <div className="flex justify-center">
          <StepFlow steps={STEPS} current={step} />
        </div>

        {/* Step 1 — Product Info */}
        {step === 0 && (
          <div
            className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-6 flex flex-col gap-4"
            style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
          >
            <h2 className="text-lg font-extrabold text-slate-800">What product are you looking for?</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                Product Name *
              </label>
              <input
                value={form.product_name}
                onChange={(e) => update("product_name", e.target.value)}
                placeholder="e.g., Oat milk, Gluten-free bread…"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                Brand (optional)
              </label>
              <input
                value={form.brand_name}
                onChange={(e) => update("brand_name", e.target.value)}
                placeholder="e.g., Oatly, Bob&apos;s Red Mill…"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                UPC / Barcode (optional)
              </label>
              <input
                value={form.upc}
                onChange={(e) => update("upc", e.target.value)}
                placeholder="Scan or enter barcode"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              disabled={!form.product_name.trim()}
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
            >
              Next: Choose Store →
            </button>
          </div>
        )}

        {/* Step 2 — Store Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div
              className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-6"
              style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
            >
              <h2 className="text-lg font-extrabold text-slate-800 mb-4">Which store?</h2>
              <div className="flex flex-col gap-2">
                {DEMO_STORES.map((store) => (
                  <button
                    key={store.store_id}
                    onClick={() => update("store_id", store.store_id)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all text-left",
                      form.store_id === store.store_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{store.store_name}</p>
                      <p className="text-xs text-slate-500">{store.retailer_chain} · ZIP {store.zip_code}</p>
                    </div>
                    {form.store_id === store.store_id && (
                      <span className="text-blue-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => update("store_id", "")}
                  className={[
                    "w-full px-4 py-3 rounded-2xl border-2 text-left transition-all",
                    !form.store_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-slate-800">Not sure / Any store</p>
                  <p className="text-xs text-slate-400">We&apos;ll route it to the best match</p>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review & Submit */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div
              className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-6"
              style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
            >
              <h2 className="text-lg font-extrabold text-slate-800 mb-4">Review &amp; submit</h2>
              <div className="flex flex-col gap-0 mb-4">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Product</span>
                  <span className="text-sm font-semibold text-slate-800">{form.product_name}</span>
                </div>
                {form.brand_name && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Brand</span>
                    <span className="text-sm font-semibold text-slate-800">{form.brand_name}</span>
                  </div>
                )}
                {form.upc && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">UPC</span>
                    <span className="text-sm font-mono text-slate-800">{form.upc}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-500">Store</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {DEMO_STORES.find((s) => s.store_id === form.store_id)?.store_name ?? "Any store"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-2">
                <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                  Add a note (optional)
                </label>
                <textarea
                  value={form.user_note}
                  onChange={(e) => update("user_note", e.target.value)}
                  placeholder="Any details that would help the store find this item…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-2 mb-2">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
                style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
              >
                {submitting ? "Submitting…" : "Submit Request ✓"}
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
