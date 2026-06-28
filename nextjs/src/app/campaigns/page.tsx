"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import TabToggle from "@/components/ui/tab-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/lib/supabase";

const TABS = ["All Campaigns", "My Campaigns"];

interface Campaign {
  campaign_id: string;
  product_name: string;
  brand_name?: string;
  store_id?: string;
  location_label?: string;
  goal_count: number;
  status: string;
  user_note?: string;
  created_at: string;
  supporter_count?: number;
  is_supporting?: boolean;
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      // All active campaigns — never expose AI fields or urgency scores
      const { data: all } = await supabase
        .from("campaigns")
        .select("campaign_id, product_name, brand_name, store_id, location_label, goal_count, status, user_note, created_at, campaign_supporters(count)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(30);

      if (all) {
        const enriched = all.map((c: Record<string, unknown>) => ({
          ...(c as Campaign),
          supporter_count: Array.isArray(c.campaign_supporters)
            ? (c.campaign_supporters as Array<{ count: number }>)[0]?.count ?? 0
            : 0,
        }));
        setCampaigns(enriched);
      }

      // My supported campaigns
      if (user) {
        const { data: mine } = await supabase
          .from("campaign_supporters")
          .select("campaign_id, campaigns(campaign_id, product_name, brand_name, store_id, location_label, goal_count, status, user_note, created_at)")
          .eq("user_id", user.id);
        if (mine) {
          setMyCampaigns(
            mine
              .map((row: Record<string, unknown>) => row.campaigns as Campaign)
              .filter(Boolean)
          );
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const joinCampaign = async (campaignId: string) => {
    if (!userId) return;
    await supabase.from("campaign_supporters").upsert({
      campaign_id: campaignId,
      user_id: userId,
    });
    setCampaigns((prev) =>
      prev.map((c) =>
        c.campaign_id === campaignId
          ? { ...c, is_supporting: true, supporter_count: (c.supporter_count ?? 0) + 1 }
          : c
      )
    );
  };

  const renderList = (list: Campaign[]) => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-5 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
          <div className="h-2 bg-slate-100 rounded w-full mb-2" />
          <div className="h-2 bg-slate-100 rounded w-1/2" />
        </div>
      ));
    }
    if (!list.length) {
      return (
        <EmptyState
          icon="📣"
          title="No campaigns yet"
          description="Be the first to start a community campaign for a product you want."
          action={{ label: "Start a Campaign", href: "/submit" }}
        />
      );
    }
    return list.map((c) => {
      const pct = Math.min(100, Math.round(((c.supporter_count ?? 0) / c.goal_count) * 100));
      return (
        <div
          key={c.campaign_id}
          className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-5 flex flex-col gap-3"
          style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">{c.product_name}</h3>
              {c.brand_name && <p className="text-sm text-slate-500">{c.brand_name}</p>}
              {c.location_label && (
                <p className="text-xs text-slate-400 mt-0.5">📍 {c.location_label}</p>
              )}
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          {/* Progress bar — never shows urgency_score */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{c.supporter_count ?? 0} supporters</span>
              <span>Goal: {c.goal_count}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)",
                }}
              />
            </div>
          </div>

          {userId && !c.is_supporting && (
            <button
              onClick={() => joinCampaign(c.campaign_id)}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
            >
              Join Campaign
            </button>
          )}
          {c.is_supporting && (
            <p className="text-center text-xs text-emerald-600 font-semibold">✓ You’re supporting this</p>
          )}
          {!userId && (
            <a
              href="/profile"
              className="block text-center text-xs text-blue-600 font-semibold py-2"
            >
              Sign in to join this campaign
            </a>
          )}
        </div>
      );
    });
  };

  return (
    <AppShell title="Campaigns">
      <div className="flex flex-col gap-4">
        <TabToggle
          tabs={TABS}
          active={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />
        <div className="flex flex-col gap-3">
          {renderList(activeTab === TABS[0] ? campaigns : myCampaigns)}
        </div>
      </div>
    </AppShell>
  );
}
