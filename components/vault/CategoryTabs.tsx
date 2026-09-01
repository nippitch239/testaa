"use client";

import { Category, CATEGORY_STYLES } from "@/lib/types";

interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {categories.map((cat) => {
        const isAll = cat === "all";
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              isActive
                ? "text-white border-transparent shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
            }`}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, #7c3aed, #a855f7)",
                  }
                : {}
            }
          >
            {isAll ? "🗂 ทั้งหมด" : cat}
          </button>
        );
      })}
    </div>
  );
}
