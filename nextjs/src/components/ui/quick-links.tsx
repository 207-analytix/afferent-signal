interface QuickLink {
  icon: string;
  label: string;
  href: string;
  color: string;
}

interface QuickLinksProps {
  links: QuickLink[];
}

export function QuickLinks({ links }: QuickLinksProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl ring-1 ring-slate-200/80 hover:shadow-md transition-all"
          style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.06)" }}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${link.color}`}
          >
            {link.icon}
          </div>
          <span className="text-xs font-semibold text-slate-600 text-center leading-tight">
            {link.label}
          </span>
        </a>
      ))}
    </div>
  );
}
