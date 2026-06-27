import Link from "next/link";

interface QuickLink {
  label: string;
  href: string;
  icon: string;
  color: string;
}

const LINKS: QuickLink[] = [
  { label: "My Requests", href: "/requests", icon: "📋", color: "bg-blue-100" },
  { label: "Campaigns",   href: "/campaigns", icon: "📣", color: "bg-emerald-100" },
  { label: "Premium",     href: "/premium",   icon: "⭐", color: "bg-amber-100" },
];

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-3 gap-3 py-2">
      {LINKS.map(({ label, href, icon, color }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white ring-1 ring-slate-200/80 hover:shadow-md transition-all"
        >
          <span className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-xl`}>
            {icon}
          </span>
          <span className="text-xs font-semibold text-slate-600 text-center leading-tight">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
