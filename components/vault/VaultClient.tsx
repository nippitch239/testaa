"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { PasswordEntry, SAMPLE_PASSWORDS } from "@/lib/types";
import VaultStats from "./VaultStats";
import CategoryTabs from "./CategoryTabs";
import PasswordCard from "./PasswordCard";
import AddPasswordModal from "./AddPasswordModal";

export default function VaultClient() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(SAMPLE_PASSWORDS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);

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

  const handleAdd = (entry: Omit<PasswordEntry, "id" | "createdAt">) => {
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setPasswords((prev) => [newEntry, ...prev]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPasswords((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-8">
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
            onClick={() => setShowModal(true)}
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
      </main>

      {/* Modal */}
      {showModal && (
        <AddPasswordModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
