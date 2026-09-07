"use client";

import { useState } from "react";
import { X, Users, Check } from "lucide-react";
import { PasswordEntry, TEAM_MEMBERS } from "@/lib/types";

interface Props {
  entry: PasswordEntry;
  onClose: () => void;
  onSave: (id: string, memberIds: string[]) => void;
}

export default function ShareModal({ entry, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>(entry.sharedWith ?? []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(entry.id, selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div className="bg-[#202228] text-[#F2F3F5] border border-[#343741] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#343741]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center bg-[#2D3050] border border-[#44487A]"
            >
              <Users className="w-4 h-4 text-[#B8B4FF]" />
            </div>
            <div>
              <h2 id="share-title" className="font-semibold text-[#F2F3F5] leading-none">
                แชร์ภายในทีม
              </h2>
              <p className="text-xs text-[#777B85] mt-1">{entry.site}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#777B85] hover:bg-[#2A2D35] hover:text-white transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member list */}
        <div className="p-6 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          <p className="text-sm text-[#A8ABB4] mb-2">
            เลือกสมาชิกในทีมที่จะให้เข้าถึงรหัสผ่านนี้ได้อย่างปลอดภัย
          </p>
          {TEAM_MEMBERS.map((member) => {
            const isSelected = selected.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggle(member.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                  isSelected
                    ? "border-[#625AFF] bg-[#2D2A50]"
                    : "border-[#343741] hover:bg-[#262830]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F2F3F5] truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-[#777B85] truncate">{member.email}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-[#554CFF] border-[#554CFF]"
                      : "border-[#4A4D58]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-md border border-[#3A3D48] text-sm text-[#B8BBC3] font-medium hover:bg-[#2A2D35] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary flex-1 py-3 rounded-md text-sm font-semibold transition-all active:scale-95"
          >
            บันทึกการแชร์
          </button>
        </div>
      </div>
    </div>
  );
}
