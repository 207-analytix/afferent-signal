"use client";

interface TabToggleProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function TabToggle({ tabs, active, onChange }: TabToggleProps) {
  return (
    <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            active === tab
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
