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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-none">
                แชร์ภายในทีม
              </h2>
              <p className="text-xs text-gray-400 mt-1">{entry.site}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member list */}
        <div className="p-6 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          <p className="text-xs text-gray-500 mb-2">
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
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-violet-600 border-violet-600"
                      : "border-gray-300"
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
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            บันทึกการแชร์
          </button>
        </div>
      </div>
    </div>
  );
}