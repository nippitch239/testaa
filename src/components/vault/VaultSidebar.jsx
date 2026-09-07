import { useEffect, useState } from "react";
import { CircleUserRound, Home, LogOut, Plus, RefreshCw, ShieldCheck, X } from "lucide-react";
import { navigate } from "../../navigation";

export default function VaultSidebar({ children, onAdd, onRefresh, refreshing = false, mobileOpen, onClose }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    navigate("/login");
  }

  return (
    <aside className={`absolute inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#2B2D35] bg-[#1B1D23] transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label="เมนูหลัก">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F5F7] text-[#11131A]"><ShieldCheck className="h-6 w-6" /></div>
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#F4F5F7]">SecureVault</p><p className="mt-0.5 text-xs text-[#7F838D]">Password manager</p></div>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-2 text-[#8B8F99] hover:bg-[#262830] hover:text-white lg:hidden" aria-label="ปิดเมนู"><X className="h-5 w-5" /></button>
      </div>
      <div className="px-4 pb-5"><button type="button" onClick={() => { onAdd(); onClose(); }} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#554CFF] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(85,76,255,.22)] transition hover:bg-[#675FFF] active:scale-[.99]"><Plus className="h-4 w-4" />เพิ่มรหัสผ่าน</button></div>
      <nav className="flex min-h-0 flex-1 flex-col px-3">
        <button type="button" className="flex h-10 items-center gap-3 rounded-lg bg-[#24262D] px-3 text-sm font-medium text-[#F0F1F3]"><Home className="h-4 w-4" />หน้าหลัก</button>
        <div className="mt-6 flex items-center justify-between px-2"><p className="text-sm font-medium text-[#C7C9CF]">หมวดหมู่</p><button type="button" onClick={onRefresh} disabled={refreshing} className="rounded-md p-1.5 text-[#777B85] hover:bg-[#262830] hover:text-[#B7BAFF] disabled:opacity-50" aria-label="รีเฟรชข้อมูล"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /></button></div>
        <div className="mt-2 min-h-0 overflow-y-auto pb-4 scrollbar-thin">{children}</div>
      </nav>
      <div className="mt-auto border-t border-[#2B2D35] p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2A2D36] text-[#AEB3FF]"><CircleUserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#ECEDEF]">{user?.username ?? "กำลังโหลด..."}</p><p className="truncate text-xs text-[#777B85]">{user?.email ?? ""}</p></div><button type="button" onClick={handleLogout} className="rounded-md p-2 text-[#777B85] hover:bg-[#2A2025] hover:text-[#FF7D88]" aria-label="ออกจากระบบ"><LogOut className="h-4 w-4" /></button></div></div>
    </aside>
  );
}
