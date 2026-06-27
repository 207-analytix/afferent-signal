import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/profile?user_id=<uuid>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(
        "user_id, email, display_name, zip_code, age_range, household_income, household_size, shopping_frequency, is_premium, premium_expiry, created_at"
      )
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("[profile GET] error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[profile GET] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/profile — update preferences
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      display_name,
      zip_code,
      age_range,
      household_income,
      household_size,
      shopping_frequency,
    } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          user_id,
          display_name,
          zip_code,
          age_range,
          household_income,
          household_size,
          shopping_frequency,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[profile PUT] error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error("[profile PUT] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
