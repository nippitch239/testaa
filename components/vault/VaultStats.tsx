import { Key, FolderOpen, ShieldCheck, Clock } from "lucide-react";
import { PasswordEntry } from "@/lib/types";

interface Props {
  passwords: PasswordEntry[];
}

export default function VaultStats({ passwords }: Props) {
  const stats = [
    {
      label: "รหัสผ่านทั้งหมด",
      value: passwords.length,
      icon: Key,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
    },
    {
      label: "หมวดหมู่",
      value: new Set(passwords.map((p) => p.category)).size,
      icon: FolderOpen,
      gradient: "from-fuchsia-500 to-pink-500",
      bg: "bg-fuchsia-50",
    },
    {
      label: "ปลอดภัย",
      value: passwords.length,
      icon: ShieldCheck,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
    },
    {
      label: "เพิ่งใช้งาน",
      value: Math.min(3, passwords.length),
      icon: Clock,
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm card-hover`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
