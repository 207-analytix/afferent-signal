interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-[28ch] mb-6">{description}</p>
      {action && (
        <a
          href={action.href}
          className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(90deg, #2563eb, #0f766e, #16a34a)" }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
