"use client";

import { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Plus, Save } from "lucide-react";
import { PasswordEntry, CATEGORIES, Category } from "@/lib/types";

interface Props {
  onClose: () => void;
  onSave: (entry: Omit<PasswordEntry, "id" | "createdAt">) => void;
  /** ถ้าส่ง entry มา = โหมดแก้ไข, ถ้าไม่ส่ง = โหมดเพิ่มใหม่ */
  entry?: PasswordEntry;
}

// สุ่ม password เบื้องต้น
function generatePassword(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from({ length: 16 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export default function PasswordFormModal({ onClose, onSave, entry }: Props) {
  const isEditMode = !!entry;

  const [form, setForm] = useState({
    site: entry?.site ?? "",
    url: entry?.url ?? "",
    username: entry?.username ?? "",
    password: entry?.password ?? "",
    category: (entry?.category ?? "Other") as Category,
    sharedWith: entry?.sharedWith ?? ([] as string[]),
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.site.trim()) e.site = "กรุณากรอกชื่อเว็บไซต์";
    if (!form.username.trim()) e.username = "กรุณากรอกอีเมล/ชื่อผู้ใช้";
    if (!form.password.trim()) e.password = "กรุณากรอกรหัสผ่าน";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="password-form-title">
      <div className="bg-[#202228] text-[#F2F3F5] border border-[#343741] rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#343741]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center bg-[#2D3050] border border-[#44487A]"
            >
              {isEditMode ? (
                <Save className="w-4 h-4 text-[#B8B4FF]" />
              ) : (
                <Plus className="w-4 h-4 text-[#B8B4FF]" />
              )}
            </div>
            <h2 id="password-form-title" className="font-semibold text-[#F2F3F5]">
              {isEditMode ? "แก้ไขรหัสผ่าน" : "เพิ่มรหัสผ่านใหม่"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#777B85] hover:bg-[#2A2D35] hover:text-white transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Site */}
          <div>
            <label className="block text-sm font-medium text-[#B8BBC3] mb-1.5">
              ชื่อเว็บไซต์ <span className="text-red-400">*</span>
            </label>
            <input
              value={form.site}
              onChange={(e) => set("site", e.target.value)}
              placeholder="เช่น GitHub, Google"
              className={`input-base ${errors.site ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            {errors.site && (
              <p className="text-red-500 text-xs mt-1">{errors.site}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-[#B8BBC3] mb-1.5">
              URL
            </label>
            <input
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="เช่น github.com"
              className="input-base"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#B8BBC3] mb-1.5">
              อีเมล / ชื่อผู้ใช้ <span className="text-red-400">*</span>
            </label>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="user@example.com"
              className={`input-base ${errors.username ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#B8BBC3] mb-1.5">
              รหัสผ่าน <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="กรอกหรือสุ่มรหัสผ่าน"
                className={`input-base pr-20 ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => set("password", generatePassword())}
                  className="p-1.5 rounded-md text-[#777B85] hover:text-[#B8B4FF] hover:bg-[#2A2D35] transition-colors"
                  title="สุ่มรหัสผ่านอัตโนมัติ"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="p-1.5 rounded-md text-[#777B85] hover:text-[#B8B4FF] hover:bg-[#2A2D35] transition-colors"
                  aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPw ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {/* Strength indicator */}
            {form.password && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => {
                  const strength =
                    form.password.length >= 16 && /[!@#$%^&*]/.test(form.password)
                      ? 4
                      : form.password.length >= 12
                      ? 3
                      : form.password.length >= 8
                      ? 2
                      : 1;
                  return (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= strength
                          ? strength === 4
                            ? "bg-green-500"
                            : strength === 3
                            ? "bg-yellow-400"
                            : strength === 2
                            ? "bg-orange-400"
                            : "bg-red-400"
                          : "bg-[#343741]"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#B8BBC3] mb-1.5">
              หมวดหมู่
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="input-base"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-md border border-[#3A3D48] text-sm text-[#B8BBC3] font-medium hover:bg-[#2A2D35] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3 rounded-md text-sm font-semibold transition-all active:scale-95"
            >
              {isEditMode ? "บันทึกการแก้ไข" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
