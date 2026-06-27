interface EmptyStateProps {
  icon: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{
            background: "linear-gradient(90deg,#2563eb,#0f766e,#16a34a)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
