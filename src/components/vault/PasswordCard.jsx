import { useState } from "react";
import { Check, Copy, ExternalLink, Eye, EyeOff, KeyRound, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { TEAM_MEMBERS } from "../../data";

const backgrounds = {
  Development: "linear-gradient(145deg, #24375b 0%, #171b2b 50%, #12141a 100%)",
  Email: "linear-gradient(145deg, #493069 0%, #241b38 52%, #13141a 100%)",
  Entertainment: "linear-gradient(145deg, #633159 0%, #2e1b2a 52%, #14151b 100%)",
  Finance: "linear-gradient(145deg, #63522c 0%, #30291d 52%, #15161a 100%)",
  Social: "linear-gradient(145deg, #31524d 0%, #1b2d2b 52%, #13151a 100%)",
  Other: "linear-gradient(145deg, #3c3f49 0%, #23252c 52%, #14151a 100%)",
};

export default function PasswordCard({ entry, onDelete, onEdit, onShare, view = "rows" }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const destination = /^https?:\/\//i.test(entry.url) ? entry.url : `https://${entry.url}`;
  const sharedCount = (entry.sharedWith ?? []).filter((id) => TEAM_MEMBERS.some((member) => member.id === id)).length;

  async function handleCopy() {
    try { await navigator.clipboard.writeText(entry.password); } catch { /* Browser may block clipboard access. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const actionMenu = <details className="relative"><summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-[#858994] hover:bg-[#2B2E36] hover:text-white [&::-webkit-details-marker]:hidden" aria-label={`เมนู ${entry.site}`}><MoreVertical className="h-4 w-4" /></summary><div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-[#343741] bg-[#202228] py-1 shadow-2xl"><a href={destination} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-[#C5C7CE] hover:bg-[#2A2D35] hover:text-white"><ExternalLink className="h-4 w-4" />เปิดเว็บไซต์</a><MenuButton onClick={() => setVisible((value) => !value)} icon={visible ? EyeOff : Eye} label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} /><MenuButton onClick={handleCopy} icon={copied ? Check : Copy} label={copied ? "คัดลอกแล้ว" : "คัดลอกรหัสผ่าน"} /><MenuButton onClick={() => onShare(entry)} icon={Users} label="แชร์ภายในทีม" /><MenuButton onClick={() => onEdit(entry)} icon={Pencil} label="แก้ไข" /><button type="button" onClick={() => onDelete(entry.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#FF858F] hover:bg-[#342329]"><Trash2 className="h-4 w-4" />ลบ</button></div></details>;

  if (view === "featured") return <article className="group relative h-44 w-[224px] shrink-0 snap-start overflow-hidden rounded-lg border border-white/5 p-4 transition duration-200 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl sm:w-[240px]" style={{ background: backgrounds[entry.category] ?? backgrounds.Other }}><KeyRound className="absolute -right-5 -top-4 h-28 w-28 rotate-12 text-white/[.055] transition-transform duration-200 group-hover:scale-105" /><div className="relative flex h-full flex-col"><div className="flex items-start justify-between"><span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70">{entry.category}</span><button type="button" onClick={() => onEdit(entry)} className="rounded-md p-1.5 text-white/60 hover:bg-black/20 hover:text-white" aria-label={`แก้ไข ${entry.site}`}><Pencil className="h-3.5 w-3.5" /></button></div><div className="mt-auto min-w-0"><p className="truncate text-base font-medium text-white">{entry.site}</p><p className="mt-2 truncate text-xs text-white/60">{entry.username}</p><p className="mt-1 font-mono text-xs tracking-widest text-white/55">••••••••••</p></div></div></article>;

  if (view === "cards") return <article className="rounded-lg border border-[#2A2D35] bg-[#202228] p-4 transition duration-200 hover:border-[#3A3D48]"><div className="flex items-start gap-3"><SiteIcon site={entry.site} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#F0F1F3]">{entry.site}</p><p className="mt-1 truncate text-xs text-[#777B85]">{entry.url}</p></div>{actionMenu}</div><div className="mt-4 grid gap-3 border-t border-[#2A2D35] pt-4 text-xs sm:grid-cols-2"><div><p className="text-[#696D77]">ชื่อผู้ใช้</p><p className="mt-1 truncate text-[#C8CAD0]">{entry.username}</p></div><div><p className="text-[#696D77]">รหัสผ่าน</p><p className="mt-1 truncate font-mono text-[#C8CAD0]">{visible ? entry.password : "••••••••••"}</p></div></div></article>;

  return <article className="grid grid-cols-[40px_minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-b border-[#292B33] bg-[#202228] px-4 py-3 transition duration-150 last:border-b-0 hover:bg-[#23252C] lg:grid-cols-[44px_minmax(140px,1fr)_120px_minmax(160px,1.2fr)_150px_44px] lg:items-center"><SiteIcon site={entry.site} /><div className="min-w-0"><p className="truncate text-sm font-medium text-[#ECEDEF]">{entry.site}</p><p className="mt-0.5 truncate text-xs text-[#6F737D]">{entry.url}</p></div><div className="col-start-2 row-start-2 lg:col-auto lg:row-auto"><span className="inline-flex rounded-md bg-[#282B33] px-2 py-1 text-xs text-[#B4B7C0]">{entry.category}</span></div><div className="col-start-2 min-w-0 lg:col-auto"><p className="truncate text-xs text-[#BABDC5]">{entry.username}</p>{sharedCount > 0 && <p className="mt-1 text-[11px] text-[#777B85]">แชร์กับ {sharedCount} คน</p>}</div><div className="col-start-2 flex min-w-0 items-center gap-2 lg:col-auto"><span className="truncate font-mono text-xs tracking-wider text-[#BFC2C9]">{visible ? entry.password : "••••••••••"}</span><IconButton onClick={() => setVisible((value) => !value)} label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} icon={visible ? EyeOff : Eye} /><IconButton onClick={handleCopy} label="คัดลอกรหัสผ่าน" icon={copied ? Check : Copy} success={copied} /></div><div className="col-start-3 row-start-1 lg:col-auto lg:row-auto">{actionMenu}</div></article>;
}

function SiteIcon({ site }) { return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D3050] text-xs font-semibold text-[#B8B4FF]">{site.charAt(0).toUpperCase()}</div>; }
function MenuButton({ onClick, icon: Icon, label }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#C5C7CE] hover:bg-[#2A2D35] hover:text-white"><Icon className="h-4 w-4" />{label}</button>; }
function IconButton({ onClick, icon: Icon, label, success }) { return <button type="button" onClick={onClick} className="rounded p-1 text-[#70747E] hover:bg-[#30333C] hover:text-white" aria-label={label}><Icon className={`h-3.5 w-3.5 ${success ? "text-[#49C68A]" : ""}`} /></button>; }
