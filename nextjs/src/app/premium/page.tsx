"use client";
import { AppShell } from "@/components/layout/app-shell";

const TIERS = [
  {
    name: "Community",
    price: "Free",
    period: "",
    highlight: false,
    features: [
      "Submit product requests",
      "Join community campaigns",
      "Basic status updates",
      "Community badge",
    ],
    cta: "Current Plan",
    ctaDisabled: true,
  },
  {
    name: "Signal+",
    price: "$3.99",
    period: "/mo",
    highlight: true,
    features: [
      "Everything in Community",
      "Priority request processing",
      "Early campaign notifications",
      "Detailed fulfillment updates",
      "Signal+ badge",
      "Cancel anytime",
    ],
    cta: "Upgrade to Signal+",
    ctaDisabled: false,
  },
  {
    name: "Community Champion",
    price: "$9.99",
    period: "/mo",
    highlight: false,
    features: [
      "Everything in Signal+",
      "Start community campaigns",
      "Direct store team feedback",
      "Monthly impact report",
      "Champion badge & recognition",
      "Early access to new features",
    ],
    cta: "Become a Champion",
    ctaDisabled: false,
  },
];

export default function PremiumPage() {
  return (
    <AppShell title="Membership">
      <div className="flex flex-col gap-5">

        {/* Hero banner */}
        <div
          className="rounded-[2rem] p-6 text-white text-center"
          style={{ background: "linear-gradient(135deg,#2563eb,#0f766e,#16a34a)" }}
        >
          <p className="text-4xl mb-2">⭐</p>
          <h2 className="text-xl font-extrabold mb-1">Amplify Your Voice</h2>
          <p className="text-sm opacity-90 max-w-[28ch] mx-auto leading-relaxed">
            Premium members get faster results and stronger influence over what their local stores stock.
          </p>
        </div>

        {/* Tier cards */}
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={[
              "rounded-[2rem] ring-1 p-5 flex flex-col gap-4 transition-all",
              tier.highlight
                ? "bg-white ring-blue-300 shadow-[0_8px_32px_rgba(37,99,235,0.18)]"
                : "bg-white ring-slate-200/80",
            ].join(" ")}
            style={!tier.highlight ? { boxShadow: "0 4px 16px rgba(37,99,235,0.06)" } : {}}
          >
            {/* Tier header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{tier.name}</h3>
                {tier.highlight && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-semibold">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-800">{tier.price}</span>
                {tier.period && <span className="text-sm text-slate-400">{tier.period}</span>}
              </div>
            </div>

            {/* Feature list */}
            <ul className="flex flex-col gap-2">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA button */}
            {tier.ctaDisabled ? (
              <div className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-400 bg-slate-100 text-center">
                {tier.cta}
              </div>
            ) : (
              <button
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
                onClick={() => alert(`Stripe integration coming soon for ${tier.name}`)}
              >
                {tier.cta}
              </button>
            )}
          </div>
        ))}

        {/* Footer note */}
        <p className="text-xs text-center text-slate-400 pb-2">
          Secure payments via Stripe. Cancel anytime. No hidden fees.
        </p>

      </div>
    </AppShell>
  );
}
