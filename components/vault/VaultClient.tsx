"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { PasswordEntry } from "@/lib/types";
import VaultStats from "./VaultStats";
import CategoryTabs from "./CategoryTabs";
import PasswordCard from "./PasswordCard";
import PasswordFormModal from "./PasswordFormModal";
import ShareModal from "./ShareModal";

// Server returns createdAt as an ISO string; PasswordEntry wants a Date.
type ApiEntry = Omit<PasswordEntry, "createdAt"> & { createdAt: string };

export default function VaultClient() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // โหมดฟอร์ม: ปิด / เพิ่มใหม่ / แก้ไข (เก็บ entry ที่กำลังแก้)
  const [formEntry, setFormEntry] = useState<PasswordEntry | "new" | null>(null);
  // entry ที่กำลังเปิดหน้าต่างแชร์อยู่ (การแชร์ยังเก็บแค่ฝั่ง client ตอนนี้)
  const [shareEntry, setShareEntry] = useState<PasswordEntry | null>(null);

  useEffect(() => {
    fetch("/api/vault")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        const data: { entries: ApiEntry[] } = await res.json();
        setPasswords(
          data.entries.map((e) => ({ ...e, createdAt: new Date(e.createdAt) }))
        );
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(passwords.map((p) => p.category)))],
    [passwords]
  );

  const filtered = useMemo(() => {
    return passwords.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.site.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q);
      const matchTab = activeTab === "all" || p.category === activeTab;
      return matchSearch && matchTab;
    });
  }, [passwords, search, activeTab]);

  const handleSave = async (data: Omit<PasswordEntry, "id" | "createdAt">) => {
    try {
      if (formEntry && formEntry !== "new") {
        // โหมดแก้ไข
        const res = await fetch(`/api/vault/${formEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("failed");
        const { entry }: { entry: ApiEntry } = await res.json();
        setPasswords((prev) =>
          prev.map((p) =>
            p.id === formEntry.id
              ? { ...entry, createdAt: new Date(entry.createdAt), sharedWith: p.sharedWith }
              : p
          )
        );
      } else {
        // โหมดเพิ่มใหม่
        const res = await fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("failed");
        const { entry }: { entry: ApiEntry } = await res.json();
        setPasswords((prev) => [
          { ...entry, createdAt: new Date(entry.createdAt) },
          ...prev,
        ]);
      }
      setFormEntry(null);
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleDelete = async (id: string) => {
    const prev = passwords;
    setPasswords((p) => p.filter((entry) => entry.id !== id)); // optimistic
    try {
      const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
    } catch {
      setPasswords(prev); // roll back
      setError("ลบไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleShareSave = (id: string, memberIds: string[]) => {
    setPasswords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, sharedWith: memberIds } : p))
    );
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
        ) : (
          <>
        {/* Stats */}
        <VaultStats passwords={passwords} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเว็บไซต์, อีเมล หรือ URL..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setFormEntry("new")}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรหัสผ่าน
          </button>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* List */}
        <div className="space-y-3 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium text-gray-500">ไม่พบรหัสผ่าน</p>
              <p className="text-sm mt-1">
                {search
                  ? `ไม่มีผลลัพธ์สำหรับ "${search}"`
                  : "เพิ่มรหัสผ่านแรกของคุณเลย!"}
              </p>
            </div>
          ) : (
            filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onEdit={(e) => setFormEntry(e)}
                onShare={(e) => setShareEntry(e)}
              />
            ))
          )}
        </div>

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            แสดง {filtered.length} จาก {passwords.length} รายการ
          </p>
        )}
          </>
        )}
      </main>

      {/* Add / Edit Modal */}
      {formEntry && (
        <PasswordFormModal
          entry={formEntry === "new" ? undefined : formEntry}
          onClose={() => setFormEntry(null)}
          onSave={handleSave}
        />
      )}

      {/* Share Modal */}
      {shareEntry && (
        <ShareModal
          entry={shareEntry}
          onClose={() => setShareEntry(null)}
          onSave={handleShareSave}
        />
      )}
    </>
  );
}