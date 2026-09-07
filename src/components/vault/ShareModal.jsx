import { useEffect, useState } from "react";
import { Check, Users, X } from "lucide-react";
import { TEAM_MEMBERS } from "../../data";

export default function ShareModal({ entry, onClose, onSave }) {
  const [selected, setSelected] = useState(entry.sharedWith ?? []);
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((memberId) => memberId !== id) : [...current, id]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-xl border border-[#343741] bg-[#202228] text-[#F2F3F5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#343741] px-5 pb-4 pt-5"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#44487A] bg-[#2D3050]"><Users className="h-4 w-4 text-[#B8B4FF]" /></div><div><h2 id="share-title" className="font-semibold leading-none">แชร์ภายในทีม</h2><p className="mt-1 text-xs text-[#777B85]">{entry.site}</p></div></div><button type="button" onClick={onClose} className="rounded-md p-1.5 text-[#777B85] hover:bg-[#2A2D35] hover:text-white" aria-label="ปิดหน้าต่าง"><X className="h-4 w-4" /></button></div>
        <div className="max-h-80 space-y-2 overflow-y-auto p-6 scrollbar-thin"><p className="mb-2 text-sm text-[#A8ABB4]">เลือกสมาชิกในทีมที่จะให้เข้าถึงรหัสผ่านนี้ได้อย่างปลอดภัย</p>{TEAM_MEMBERS.map((member) => { const active = selected.includes(member.id); return <button key={member.id} type="button" onClick={() => toggle(member.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${active ? "border-[#625AFF] bg-[#2D2A50]" : "border-[#343741] hover:bg-[#262830]"}`} aria-pressed={active}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-sm font-bold text-white`}>{member.name.charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{member.name}</p><p className="truncate text-xs text-[#777B85]">{member.email}</p></div><div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? "border-[#554CFF] bg-[#554CFF]" : "border-[#4A4D58]"}`}>{active && <Check className="h-3.5 w-3.5 text-white" />}</div></button>; })}</div>
        <div className="flex gap-3 px-6 pb-6 pt-2"><button type="button" onClick={onClose} className="flex-1 rounded-md border border-[#3A3D48] py-3 text-sm font-medium text-[#B8BBC3] hover:bg-[#2A2D35]">ยกเลิก</button><button type="button" onClick={() => { onSave(entry.id, selected); onClose(); }} className="btn-primary flex-1 rounded-md py-3 text-sm font-semibold">บันทึกการแชร์</button></div>
      </div>
    </div>
  );
}
