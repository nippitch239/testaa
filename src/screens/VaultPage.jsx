import { useCallback, useEffect, useMemo, useState } from "react";

import { LayoutGrid, Menu, RotateCcw, Rows3, Search, SlidersHorizontal } from "lucide-react";
import CategoryTabs from "../components/vault/CategoryTabs";
import PasswordCard from "../components/vault/PasswordCard";
import PasswordFormModal from "../components/vault/PasswordFormModal";
import ShareModal from "../components/vault/ShareModal";
import VaultSidebar from "../components/vault/VaultSidebar";

function normalizeEntries(entries) {
  return entries.map((entry) => ({ ...entry, createdAt: new Date(entry.createdAt) }));
}

export default function VaultPage() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [view, setView] = useState("rows");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formEntry, setFormEntry] = useState(null);
  const [shareEntry, setShareEntry] = useState(null);

  const loadPasswords = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/vault");
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      setPasswords(normalizeEntries(data.entries));
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/vault")
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json();
      })
      .then((data) => { if (active) setPasswords(normalizeEntries(data.entries)); })
      .catch(() => { if (active) setError("โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => ["all", ...new Set(passwords.map((entry) => entry.category))], [passwords]);
  const categoryCounts = useMemo(() => passwords.reduce((counts, entry) => ({ ...counts, [entry.category]: (counts[entry.category] ?? 0) + 1 }), { all: passwords.length }), [passwords]);
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return passwords.filter((entry) => (activeCategory === "all" || entry.category === activeCategory) && [entry.site, entry.username, entry.url].some((value) => value.toLowerCase().includes(query)));
  }, [activeCategory, passwords, search]);
  const recent = useMemo(() => [...passwords].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime()).slice(0, 5), [passwords]);

  async function handleSave(data) {
    try {
      const editing = formEntry && formEntry !== "new";
      const response = await fetch(editing ? `/api/vault/${formEntry.id}` : "/api/vault", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("request failed");
      const { entry } = await response.json();
      const normalized = { ...entry, createdAt: new Date(entry.createdAt) };
      setPasswords((current) => editing ? current.map((item) => item.id === formEntry.id ? { ...normalized, sharedWith: item.sharedWith } : item) : [normalized, ...current]);
      setFormEntry(null);
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  async function handleDelete(id) {
    const previous = passwords;
    setPasswords((entries) => entries.filter((entry) => entry.id !== id));
    try {
      const response = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("request failed");
    } catch {
      setPasswords(previous);
      setError("ลบไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  function handleShareSave(id, memberIds) {
    setPasswords((current) => current.map((entry) => entry.id === id ? { ...entry, sharedWith: memberIds } : entry));
  }

  const cardProps = (entry) => ({ entry, onDelete: handleDelete, onEdit: setFormEntry, onShare: setShareEntry });

  return (
    <div className="h-screen min-h-screen overflow-hidden bg-[#090B12]">
      <div className="relative grid h-screen w-full overflow-hidden bg-[#17191F] lg:grid-cols-[240px_minmax(0,1fr)]">
        {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="absolute inset-0 z-40 bg-black/60 lg:hidden" aria-label="ปิดเมนู" />}
        <VaultSidebar onAdd={() => setFormEntry("new")} onRefresh={() => loadPasswords(true)} refreshing={refreshing} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <CategoryTabs categories={categories} counts={categoryCounts} active={activeCategory} onChange={(category) => { setActiveCategory(category); setSidebarOpen(false); }} />
        </VaultSidebar>

        <main className="flex min-h-screen min-w-0 flex-col bg-[#17191F] lg:min-h-0" aria-label="คลังรหัสผ่าน">
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-[#22242C] px-4 sm:px-6">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#A2A5AE] hover:bg-[#24262D] hover:text-white lg:hidden" aria-label="เปิดเมนู"><Menu className="h-5 w-5" /></button>
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777B85]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัสผ่าน" aria-label="ค้นหารหัสผ่าน" className="h-11 w-full rounded-lg border border-[#2A2C34] bg-[#24262D] pl-11 pr-4 text-sm text-[#F2F3F5] placeholder:text-[#777B85] focus:border-[#625AFF] focus:bg-[#262830]" /></div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 scrollbar-thin sm:px-6 lg:px-8">
            {error && <div role="alert" className="mb-5 rounded-lg border border-[#65333A] bg-[#2A1D21] px-4 py-3 text-sm text-[#FF9AA4]">{error}</div>}
            {!loading && recent.length > 0 && <section aria-labelledby="recent-title"><h1 id="recent-title" className="mb-4 text-lg font-medium text-[#F4F5F7]">รายการล่าสุด</h1><div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">{recent.map((entry) => <PasswordCard key={`recent-${entry.id}`} {...cardProps(entry)} view="featured" />)}</div></section>}

            <section className={recent.length > 0 ? "mt-8" : ""} aria-labelledby="password-list-title">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><h2 id="password-list-title" className="text-lg font-medium text-[#F4F5F7]">{activeCategory === "all" ? "รหัสผ่านทั้งหมด" : activeCategory}</h2><span className="rounded-md bg-[#24262D] px-2 py-1 text-xs text-[#B8BBC3]">{filtered.length}</span></div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setSearch(""); setActiveCategory("all"); }} disabled={!search && activeCategory === "all"} className="flex h-9 items-center gap-2 rounded-lg border border-[#2D3039] px-3 text-sm text-[#A8ABB4] hover:bg-[#24262D] hover:text-white disabled:opacity-40"><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">รีเซ็ต</span></button>
                  <div className="flex overflow-hidden rounded-lg border border-[#2D3039]" aria-label="เปลี่ยนมุมมอง"><ViewButton active={view === "rows"} onClick={() => setView("rows")} label="มุมมองรายการ" icon={Rows3} /><ViewButton active={view === "cards"} onClick={() => setView("cards")} label="มุมมองการ์ด" icon={LayoutGrid} border /></div>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8B8F99] hover:bg-[#24262D] hover:text-white" aria-label="ตัวเลือกการแสดงผล"><SlidersHorizontal className="h-4 w-4" /></button>
                </div>
              </div>

              {loading ? <div className="space-y-px overflow-hidden rounded-lg border border-[#292B33]" aria-label="กำลังโหลด">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse bg-[#202228]" />)}</div> : filtered.length === 0 ? <div className="rounded-lg border border-dashed border-[#333640] py-16 text-center text-[#777B85]"><Search className="mx-auto mb-3 h-7 w-7" /><p className="text-sm text-[#B4B7BF]">ไม่พบรหัสผ่าน</p><p className="mt-1 px-4 text-xs">{search ? `ไม่มีผลลัพธ์สำหรับ “${search}”` : "ยังไม่มีข้อมูลในหมวดหมู่นี้"}</p></div> : <><div className={view === "rows" ? "hidden grid-cols-[44px_minmax(140px,1fr)_120px_minmax(160px,1.2fr)_150px_44px] items-center gap-3 rounded-t-lg border border-b-0 border-[#292B33] bg-[#202228] px-4 py-3 text-xs text-[#777B85] lg:grid" : "hidden"}><span /><span>เว็บไซต์</span><span>หมวดหมู่</span><span>ชื่อผู้ใช้</span><span>รหัสผ่าน</span><span /></div><div className={view === "cards" ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : "overflow-hidden rounded-lg border border-[#292B33] lg:rounded-t-none"}>{filtered.map((entry) => <PasswordCard key={entry.id} {...cardProps(entry)} view={view} />)}</div></>}
            </section>
          </div>
        </main>
      </div>
      {formEntry && <PasswordFormModal entry={formEntry === "new" ? undefined : formEntry} onClose={() => setFormEntry(null)} onSave={handleSave} />}
      {shareEntry && <ShareModal entry={shareEntry} onClose={() => setShareEntry(null)} onSave={handleShareSave} />}
    </div>
  );
}

function ViewButton({ active, onClick, label, icon: Icon, border }) {
  return <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} className={`flex h-9 w-9 items-center justify-center ${border ? "border-l border-[#2D3039]" : ""} ${active ? "bg-[#2D2A50] text-[#B8B4FF]" : "text-[#777B85] hover:bg-[#24262D]"}`}><Icon className="h-4 w-4" /></button>;
}
