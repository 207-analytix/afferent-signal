import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStatusLabel, getStatusPillClass } from "@/lib/status-map";

// GET /api/requests?user_id=<uuid>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    // RULE: select only consumer-safe columns — never fetch urgency_score or ai_* fields
    const { data, error } = await supabaseAdmin
      .from("product_requests")
      .select("request_id, product_name, brand_name, store_id, status, submitted_at")
      .eq("user_id", user_id)
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[requests GET] error:", error);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    // RULE: translate every status through status-map before returning to consumer
    const result = (data ?? []).map((r) => ({
      request_id: r.request_id,
      product_name: r.product_name,
      brand_name: r.brand_name,
      store_id: r.store_id,
      status_label: getStatusLabel(r.status),
      status_pill_class: getStatusPillClass(r.status),
      submitted_at: r.submitted_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[requests GET] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
