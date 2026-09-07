"use client";

import { KeyRound } from "lucide-react";

interface Props {
  categories: string[];
  active: string;
  counts: Record<string, number>;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ categories, counts, active, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1" role="listbox" aria-label="หมวดหมู่รหัสผ่าน">
      {categories.map((cat) => {
        const isAll = cat === "all";
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            role="option"
            aria-selected={isActive}
            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
              isActive
                ? "bg-[#282A33] text-[#F0F1F3]"
                : "text-[#92959F] hover:bg-[#23252C] hover:text-[#D5D7DC]"
            }`}
          >
            <KeyRound className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#8D86FF]" : "text-[#646873]"}`} />
            <span className="truncate">{isAll ? "รหัสผ่านทั้งหมด" : cat}</span>
            <span className={`ml-auto min-w-6 rounded-md px-1.5 py-0.5 text-center text-[11px] tabular-nums ${isActive ? "bg-[#373A45] text-[#C9CBD1]" : "bg-[#23252C] text-[#737782]"}`}>{counts[cat] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
