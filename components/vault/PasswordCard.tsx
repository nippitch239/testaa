"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Pencil,
  Users,
} from "lucide-react";
import { PasswordEntry, CATEGORY_STYLES, TEAM_MEMBERS } from "@/lib/types";

interface Props {
  entry: PasswordEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: PasswordEntry) => void;
  onShare: (entry: PasswordEntry) => void;
}

export default function PasswordCard({ entry, onDelete, onEdit, onShare }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.password);
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initial = entry.site.charAt(0).toUpperCase();
  const sharedMembers = (entry.sharedWith ?? [])
    .map((id) => TEAM_MEMBERS.find((m) => m.id === id))
    .filter((m): m is (typeof TEAM_MEMBERS)[number] => !!m);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 card-hover group">
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-violet-600 font-bold text-lg flex-shrink-0 select-none"
        style={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
      >
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm">{entry.site}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              CATEGORY_STYLES[entry.category]
            }`}
          >
            {entry.category}
          </span>
          {sharedMembers.length > 0 && (
            <span className="flex items-center -space-x-1.5">
              {sharedMembers.slice(0, 3).map((m) => (
                <span
                  key={m.id}
                  title={m.name}
                  className={`w-5 h-5 rounded-full bg-gradient-to-br ${m.color} border-2 border-white flex items-center justify-center text-[9px] font-bold text-white`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {sharedMembers.length > 3 && (
                <span className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600">
                  +{sharedMembers.length - 3}
                </span>
              )}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{entry.username}</p>
        <p className="text-xs font-mono text-gray-700 mt-0.5 tracking-wider">
          {visible ? entry.password : "•".repeat(Math.min(entry.password.length, 16))}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Visit */}
        <a
          href={`https://${entry.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-violet-600 transition-colors"
          title="เปิดเว็บไซต์"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Show/Hide */}
        <button
          onClick={() => setVisible(!visible)}
          className={`p-2 rounded-lg transition-colors ${
            visible
              ? "bg-violet-100 text-violet-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          title="แสดง/ซ่อนรหัสผ่าน"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-colors ${
            copied
              ? "bg-green-100 text-green-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          title="คัดลอกรหัสผ่าน"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        {/* Share */}
        <button
          onClick={() => onShare(entry)}
          className={`p-2 rounded-lg transition-colors ${
            sharedMembers.length > 0
              ? "bg-blue-100 text-blue-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          title="แชร์ภายในทีม"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(entry)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-violet-600 transition-colors"
          title="แก้ไข"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(entry.id)}
          className="p-2 rounded-lg text-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="ลบ"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}