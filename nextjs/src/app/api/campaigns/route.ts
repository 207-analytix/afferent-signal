import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/campaigns?user_id=<uuid>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  try {
    // Fetch active campaigns with supporter counts
    const { data: campaigns, error } = await supabaseAdmin
      .from("campaigns")
      .select(`
        campaign_id,
        product_name,
        brand_name,
        store_id,
        location_label,
        goal_count,
        status,
        campaign_supporters(count)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[campaigns GET] error:", error);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    // Fetch which campaigns the current user has joined
    let joinedSet = new Set<string>();
    if (user_id) {
      const { data: joined } = await supabaseAdmin
        .from("campaign_supporters")
        .select("campaign_id")
        .eq("user_id", user_id);
      if (joined) joinedSet = new Set(joined.map((j) => j.campaign_id));
    }

    const result = (campaigns ?? []).map((c) => {
      const supporters = c.campaign_supporters as unknown as { count: number }[];
      return {
        campaign_id: c.campaign_id,
        product_name: c.product_name,
        brand_name: c.brand_name,
        store_id: c.store_id,
        location_label: c.location_label,
        goal_count: c.goal_count,
        status: c.status,
        supporter_count: supporters?.[0]?.count ?? 0,
        is_joined: joinedSet.has(c.campaign_id),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[campaigns GET] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/campaigns — join a campaign
export async function POST(req: NextRequest) {
  try {
    const { campaign_id, user_id } = await req.json();

    if (!campaign_id || !user_id) {
      return NextResponse.json(
        { error: "campaign_id and user_id are required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("campaign_supporters")
      .upsert({ campaign_id, user_id }, { onConflict: "campaign_id,user_id" });

    if (error) {
      console.error("[campaigns POST] error:", error);
      return NextResponse.json({ error: "Failed to join campaign" }, { status: 500 });
    }

    return NextResponse.json({ joined: true });
  } catch (err) {
    console.error("[campaigns POST] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
