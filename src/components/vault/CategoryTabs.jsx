import { KeyRound } from "lucide-react";

export default function CategoryTabs({ categories, counts, active, onChange }) {
  return (
    <div className="flex flex-col gap-1" role="listbox" aria-label="หมวดหมู่รหัสผ่าน">
      {categories.map((category) => {
        const selected = active === category;
        return (
          <button key={category} type="button" onClick={() => onChange(category)} role="option" aria-selected={selected} className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${selected ? "bg-[#282A33] text-[#F0F1F3]" : "text-[#92959F] hover:bg-[#23252C] hover:text-[#D5D7DC]"}`}>
            <KeyRound className={`h-3.5 w-3.5 shrink-0 ${selected ? "text-[#8D86FF]" : "text-[#646873]"}`} />
            <span className="truncate">{category === "all" ? "รหัสผ่านทั้งหมด" : category}</span>
            <span className={`ml-auto min-w-6 rounded-md px-1.5 py-0.5 text-center text-[11px] tabular-nums ${selected ? "bg-[#373A45] text-[#C9CBD1]" : "bg-[#23252C] text-[#737782]"}`}>{counts[category] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
