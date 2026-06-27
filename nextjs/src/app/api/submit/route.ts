import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStatusLabel } from "@/lib/status-map";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, store_id, product_name, brand_name, upc, user_note } = body;

    if (!user_id || !store_id || !product_name) {
      return NextResponse.json(
        { error: "user_id, store_id, and product_name are required" },
        { status: 400 }
      );
    }

    // Service role bypasses RLS — safe for server-side insert
    const { data, error } = await supabaseAdmin
      .from("product_requests")
      .insert({
        user_id,
        store_id,
        product_name,
        brand_name: brand_name ?? null,
        upc: upc ?? null,
        user_note: user_note ?? null,
        status: "PENDING",
      })
      .select("request_id, status, submitted_at")
      .single();

    if (error) {
      console.error("[submit] Supabase error:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // RULE: translate status before returning — never expose raw 'PENDING'
    return NextResponse.json({
      request_id: data.request_id,
      status_label: getStatusLabel(data.status),
      submitted_at: data.submitted_at,
    });
  } catch (err) {
    console.error("[submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
