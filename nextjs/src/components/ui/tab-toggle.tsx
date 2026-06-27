"use client";
import { useState } from "react";

interface TabToggleProps {
  tabs: string[];
  onChange?: (tab: string, index: number) => void;
  defaultIndex?: number;
}

export function TabToggle({ tabs, onChange, defaultIndex = 0 }: TabToggleProps) {
  const [active, setActive] = useState(defaultIndex);

  const handleClick = (tab: string, idx: number) => {
    setActive(idx);
    onChange?.(tab, idx);
  };

  return (
    <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          onClick={() => handleClick(tab, idx)}
          className={[
            "flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200",
            active === idx
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
