"use client";

interface Step {
  label: string;
  icon?: string;
}

interface StepFlowProps {
  steps: Step[];
  current: number;
}

export function StepFlow({ steps, current }: StepFlowProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-white border-blue-600 text-blue-600"
                    : "bg-white border-slate-200 text-slate-400",
                ].join(" ")}
              >
                {done ? "✓" : idx + 1}
              </div>
              <span
                className={[
                  "text-xs font-medium whitespace-nowrap",
                  active ? "text-blue-600" : done ? "text-emerald-600" : "text-slate-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={[
                  "h-0.5 w-8 mx-1 mb-5 rounded transition-all",
                  done ? "bg-emerald-400" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
