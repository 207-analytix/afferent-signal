"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getStatusLabel, getStatusPillClass } from "@/lib/status-map";
import { supabase } from "@/lib/supabase";

interface ProductRequest {
  request_id: string;
  product_name: string;
  brand_name?: string;
  store_id?: string;
  status: string;
  submitted_at: string;
  user_note?: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Only fetch consumer-safe columns — never urgency_score or ai_* fields
      const { data } = await supabase
        .from("product_requests")
        .select("request_id, product_name, brand_name, store_id, status, submitted_at, user_note")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      setRequests(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const dotStyle = (status: string) => {
    if (status === "FULFILLED") return "border-emerald-500 text-emerald-600";
    if (status === "ACTIVE") return "border-blue-500 text-blue-600";
    if (status === "CLOSED") return "border-slate-300 text-slate-400";
    return "border-amber-400 text-amber-500";
  };

  const dotSymbol = (status: string) => {
    if (status === "FULFILLED") return "✓";
    if (status === "ACTIVE") return "→";
    return "·";
  };

  return (
    <AppShell title="My Requests">
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))
        ) : !requests.length ? (
          <EmptyState
            icon="🛒"
            title="No requests yet"
            description="Submit your first product request and we’ll send the signal to your local store."
            action={{ label: "Request a Product", href: "/submit" }}
          />
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[1.35rem] top-6 bottom-6 w-0.5 bg-slate-200 z-0" />

            <div className="flex flex-col gap-4">
              {requests.map((req) => (
                <div key={req.request_id} className="flex gap-4 items-start relative">

                  {/* Timeline dot */}
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 bg-white ${dotStyle(req.status)}`}
                  >
                    {dotSymbol(req.status)}
                  </div>

                  {/* Request card */}
                  <div
                    className="flex-1 bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-4 flex flex-col gap-2"
                    style={{ boxShadow: "0 4px 16px rgba(37,99,235,0.06)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800">{req.product_name}</h3>
                        {req.brand_name && (
                          <p className="text-xs text-slate-500">{req.brand_name}</p>
                        )}
                      </div>
                      {/* Status pill — always translated through status-map, never raw */}
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusPillClass(req.status)}`}>
                        {req.status === "FULFILLED" ? "Fulfilled 🎉" :
                         req.status === "ACTIVE" ? "Active" :
                         req.status === "CLOSED" ? "Closed" : "Pending"}
                      </span>
                    </div>

                    {/* Consumer-friendly status message from status-map */}
                    <p className="text-xs text-slate-500">{getStatusLabel(req.status)}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{formatDate(req.submitted_at)}</span>
                      {req.store_id && (
                        <span className="text-xs text-slate-400">🏪 {req.store_id.split("_")[0]}</span>
                      )}
                    </div>

                    {req.user_note && (
                      <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2 mt-1">
                        “{req.user_note}”
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
