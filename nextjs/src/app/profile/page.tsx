"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { QuickLinks } from "@/components/ui/quick-links";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  user_id: string;
  email: string;
  display_name?: string;
  zip_code?: string;
  age_range?: string;
  household_income?: string;
  household_size?: string;
  shopping_frequency?: string;
  is_premium?: boolean;
}

const AGE_RANGES = ["Under 25", "25–34", "35–44", "45–54", "55–64", "65+"];
const INCOMES = ["Under $30K", "$30K–$50K", "$50K–$75K", "$75K–$100K", "$100K+", "Prefer not to say"];
const SIZES = ["1", "2", "3–4", "5+"];
const FREQS = ["Daily", "2–3x/week", "Weekly", "Bi-weekly", "Monthly"];

const QUICK_LINKS = [
  { icon: "🛒", label: "My Requests", href: "/requests", color: "bg-blue-100 text-blue-600" },
  { icon: "📣", label: "Campaigns", href: "/campaigns", color: "bg-emerald-100 text-emerald-600" },
  { icon: "⭐", label: "Go Premium", href: "/premium", color: "bg-amber-100 text-amber-600" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("users")
        .select("user_id, email, display_name, zip_code, age_range, household_income, household_size, shopping_frequency, is_premium")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
      else setProfile({ user_id: user.id, email: user.email ?? "" });
      setLoading(false);
    };
    load();
  }, []);

  const update = (k: keyof UserProfile, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .upsert({ ...profile });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <AppShell title="Profile">
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] ring-1 ring-slate-100 p-5 h-20" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile">
      <div className="flex flex-col gap-4">

        {/* Avatar + identity card */}
        <div
          className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-5 flex items-center gap-4"
          style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#2563eb,#0f766e)" }}
          >
            {(profile.display_name ?? profile.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-extrabold text-slate-800">
              {profile.display_name ?? "Shopper"}
            </p>
            <p className="text-sm text-slate-500">{profile.email}</p>
            {profile.is_premium && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold self-start">
                ⭐ Premium
              </span>
            )}
          </div>
        </div>

        {/* Quick links */}
        <QuickLinks links={QUICK_LINKS} />

        {/* Preferences form */}
        <div
          className="bg-white rounded-[2rem] ring-1 ring-slate-200/80 p-5 flex flex-col gap-4"
          style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}
        >
          <h2 className="text-lg font-extrabold text-slate-800">Preferences</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Display Name</label>
            <input
              value={profile.display_name ?? ""}
              onChange={(e) => update("display_name", e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">ZIP Code</label>
            <input
              value={profile.zip_code ?? ""}
              onChange={(e) => update("zip_code", e.target.value)}
              placeholder="e.g., 04020"
              maxLength={10}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Age Range</label>
            <select
              value={profile.age_range ?? ""}
              onChange={(e) => update("age_range", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Prefer not to say</option>
              {AGE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Household Income</label>
            <select
              value={profile.household_income ?? ""}
              onChange={(e) => update("household_income", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Prefer not to say</option>
              {INCOMES.map((inc) => <option key={inc} value={inc}>{inc}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Household Size</label>
            <select
              value={profile.household_size ?? ""}
              onChange={(e) => update("household_size", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size</option>
              {SIZES.map((s) => <option key={s} value={s}>{s} person{s === "1" ? "" : "s"}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Shopping Frequency</label>
            <select
              value={profile.shopping_frequency ?? ""}
              onChange={(e) => update("shopping_frequency", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select frequency</option>
              {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {saved && (
            <p className="text-xs text-emerald-600 font-semibold text-center">✓ Preferences saved!</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
            style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
        >
          Sign Out
        </button>

      </div>
    </AppShell>
  );
}
