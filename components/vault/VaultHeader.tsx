"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";

export default function VaultHeader() {
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none">SecureVault</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Password Manager</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            K
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-gray-800 leading-none">bubu</p>
            <p className="text-xs text-gray-400 mt-0.5">bubu@kmitl.ac.th</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="ml-1 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
