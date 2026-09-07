"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, RotateCcw, Rows3, LayoutGrid, SlidersHorizontal, Menu } from "lucide-react";
import { PasswordEntry } from "@/lib/types";
import CategoryTabs from "./CategoryTabs";
import PasswordCard from "./PasswordCard";
import PasswordFormModal from "./PasswordFormModal";
import ShareModal from "./ShareModal";
import VaultHeader from "./VaultHeader";

type ApiEntry = Omit<PasswordEntry, "createdAt"> & { createdAt: string };

export default function VaultClient() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"rows" | "cards">("rows");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formEntry, setFormEntry] = useState<PasswordEntry | "new" | null>(null);
  const [shareEntry, setShareEntry] = useState<PasswordEntry | null>(null);

  const loadPasswords = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vault");
      if (!res.ok) throw new Error("failed");
      const data: { entries: ApiEntry[] } = await res.json();
      setPasswords(data.entries.map((entry) => ({ ...entry, createdAt: new Date(entry.createdAt) })));
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/vault")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        const data: { entries: ApiEntry[] } = await res.json();
        setPasswords(data.entries.map((entry) => ({ ...entry, createdAt: new Date(entry.createdAt) })));
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(passwords.map((password) => password.category)))],
    [passwords]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: passwords.length };
    passwords.forEach((entry) => {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    });
    return counts;
  }, [passwords]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return passwords.filter((password) => {
      const matchesSearch =
        password.site.toLowerCase().includes(query) ||
        password.username.toLowerCase().includes(query) ||
        password.url.toLowerCase().includes(query);
      const matchesCategory = activeTab === "all" || password.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [passwords, search, activeTab]);

  const recent = useMemo(
    () => [...passwords].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
    [passwords]
  );

  const handleSave = async (data: Omit<PasswordEntry, "id" | "createdAt">) => {
    try {
      if (formEntry && formEntry !== "new") {
        const res = await fetch(`/api/vault/${formEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("failed");
        const { entry }: { entry: ApiEntry } = await res.json();
        setPasswords((previous) =>
          previous.map((password) =>
            password.id === formEntry.id
              ? { ...entry, createdAt: new Date(entry.createdAt), sharedWith: password.sharedWith }
              : password
          )
        );
      } else {
        const res = await fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("failed");
        const { entry }: { entry: ApiEntry } = await res.json();
        setPasswords((previous) => [{ ...entry, createdAt: new Date(entry.createdAt) }, ...previous]);
      }
      setFormEntry(null);
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleDelete = async (id: string) => {
    const previous = passwords;
    setPasswords((entries) => entries.filter((entry) => entry.id !== id));
    try {
      const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
    } catch {
      setPasswords(previous);
      setError("ลบไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleShareSave = (id: string, memberIds: string[]) => {
    setPasswords((previous) =>
      previous.map((password) => (password.id === id ? { ...password, sharedWith: memberIds } : password))
    );
  };

  return (
    <div className="h-screen min-h-screen overflow-hidden bg-[#090B12]">
      <div className="relative h-screen w-full overflow-hidden bg-[#17191F] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        {sidebarOpen && (
          <button type="button" onClick={() => setSidebarOpen(false)} className="absolute inset-0 z-40 bg-black/60 lg:hidden" aria-label="ปิดเมนู" />
        )}

        <VaultHeader
          onAdd={() => setFormEntry("new")}
          onRefresh={() => loadPasswords(true)}
          refreshing={refreshing}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <CategoryTabs categories={categories} counts={categoryCounts} active={activeTab} onChange={(category) => { setActiveTab(category); setSidebarOpen(false); }} />
        </VaultHeader>

        <main className="flex min-h-screen min-w-0 flex-col bg-[#17191F] md:min-h-0" aria-label="คลังรหัสผ่าน">
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-[#22242C] px-4 sm:px-6">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#A2A5AE] hover:bg-[#24262D] hover:text-white lg:hidden" aria-label="เปิดเมนู">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777B85]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัสผ่าน" aria-label="ค้นหารหัสผ่าน" className="h-11 w-full rounded-lg border border-[#2A2C34] bg-[#24262D] pl-11 pr-4 text-sm text-[#F2F3F5] placeholder:text-[#777B85] focus:border-[#625AFF] focus:bg-[#262830]" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 scrollbar-thin sm:px-6 lg:px-8">
            {error && (
              <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-[#65333A] bg-[#2A1D21] px-4 py-3 text-sm text-[#FF9AA4]">{error}</div>
            )}

            {!loading && recent.length > 0 && (
              <section aria-labelledby="recent-title">
                <h1 id="recent-title" className="mb-4 text-lg font-medium text-[#F4F5F7]">รายการล่าสุด</h1>
                <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {recent.map((entry) => (
                    <PasswordCard key={`recent-${entry.id}`} entry={entry} view="featured" onDelete={handleDelete} onEdit={(password) => setFormEntry(password)} onShare={(password) => setShareEntry(password)} />
                  ))}
                </div>
              </section>
            )}

            <section className={recent.length > 0 ? "mt-8" : ""} aria-labelledby="password-list-title">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 id="password-list-title" className="text-lg font-medium text-[#F4F5F7]">{activeTab === "all" ? "รหัสผ่านทั้งหมด" : activeTab}</h2>
                  <span className="rounded-md bg-[#24262D] px-2 py-1 text-xs text-[#B8BBC3]">{filtered.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setSearch(""); setActiveTab("all"); }} disabled={!search && activeTab === "all"} className="flex h-9 items-center gap-2 rounded-lg border border-[#2D3039] px-3 text-sm text-[#A8ABB4] hover:bg-[#24262D] hover:text-white disabled:opacity-40">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">รีเซ็ต</span>
                  </button>
                  <div className="flex overflow-hidden rounded-lg border border-[#2D3039]" aria-label="เปลี่ยนมุมมอง">
                    <button type="button" onClick={() => setView("rows")} aria-label="มุมมองรายการ" aria-pressed={view === "rows"} className={`flex h-9 w-9 items-center justify-center ${view === "rows" ? "bg-[#2D2A50] text-[#B8B4FF]" : "text-[#777B85] hover:bg-[#24262D]"}`}><Rows3 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setView("cards")} aria-label="มุมมองการ์ด" aria-pressed={view === "cards"} className={`flex h-9 w-9 items-center justify-center border-l border-[#2D3039] ${view === "cards" ? "bg-[#2D2A50] text-[#B8B4FF]" : "text-[#777B85] hover:bg-[#24262D]"}`}><LayoutGrid className="h-4 w-4" /></button>
                  </div>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8B8F99] hover:bg-[#24262D] hover:text-white" aria-label="ตัวเลือกการแสดงผล"><SlidersHorizontal className="h-4 w-4" /></button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-px overflow-hidden rounded-lg border border-[#292B33]" aria-label="กำลังโหลด">
                  {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse bg-[#202228]" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#333640] py-16 text-center text-[#777B85]">
                  <Search className="mx-auto mb-3 h-7 w-7" />
                  <p className="text-sm text-[#B4B7BF]">ไม่พบรหัสผ่าน</p>
                  <p className="mt-1 px-4 text-xs">{search ? `ไม่มีผลลัพธ์สำหรับ “${search}”` : "ยังไม่มีข้อมูลในหมวดหมู่นี้"}</p>
                </div>
              ) : (
                <>
                  {view === "rows" && (
                    <div className="hidden grid-cols-[44px_minmax(140px,1fr)_120px_minmax(160px,1.2fr)_150px_44px] items-center gap-3 rounded-t-lg border border-b-0 border-[#292B33] bg-[#202228] px-4 py-3 text-xs text-[#777B85] lg:grid">
                      <span /><span>เว็บไซต์</span><span>หมวดหมู่</span><span>ชื่อผู้ใช้</span><span>รหัสผ่าน</span><span />
                    </div>
                  )}
                  <div className={view === "cards" ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : "overflow-hidden rounded-lg border border-[#292B33] lg:rounded-t-none"}>
                    {filtered.map((entry) => (
                      <PasswordCard key={entry.id} entry={entry} view={view} onDelete={handleDelete} onEdit={(password) => setFormEntry(password)} onShare={(password) => setShareEntry(password)} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {formEntry && <PasswordFormModal entry={formEntry === "new" ? undefined : formEntry} onClose={() => setFormEntry(null)} onSave={handleSave} />}
      {shareEntry && <ShareModal entry={shareEntry} onClose={() => setShareEntry(null)} onSave={handleShareSave} />}
    </div>
  );
}
