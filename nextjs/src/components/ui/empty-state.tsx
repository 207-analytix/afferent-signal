"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  /** Body text — also accepts `description` alias */
  body?: string;
  description?: string;
  /** Button label — also accepts action.label */
  actionLabel?: string;
  onAction?: () => void;
  /** Link-style action: { label, href } */
  action?: { label: string; href: string };
}

export function EmptyState({
  icon,
  title,
  body,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  const bodyText = body ?? description ?? "";
  const btnLabel = actionLabel ?? action?.label;

  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
      {bodyText && <p className="text-sm text-slate-500 max-w-xs mb-6">{bodyText}</p>}
      {action ? (
        <a
          href={action.href}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white inline-block"
          style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
        >
          {action.label}
        </a>
      ) : btnLabel && onAction ? (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)" }}
        >
          {btnLabel}
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
