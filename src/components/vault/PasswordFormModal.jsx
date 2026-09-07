import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, X } from "lucide-react";
import { CATEGORIES } from "../../data";

function generatePassword() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from({ length: 16 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
}

export default function PasswordFormModal({ onClose, onSave, entry }) {
  const panelRef = useRef(null);
  const [form, setForm] = useState({ site: entry?.site ?? "", url: entry?.url ?? "", username: entry?.username ?? "", password: entry?.password ?? "", category: entry?.category ?? "Other", sharedWith: entry?.sharedWith ?? [] });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const firstInput = panelRef.current?.querySelector("input");
    firstInput?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.site.trim()) nextErrors.site = "กรุณากรอกชื่อเว็บไซต์";
    if (!form.username.trim()) nextErrors.username = "กรุณากรอกอีเมล/ชื่อผู้ใช้";
    if (!form.password.trim()) nextErrors.password = "กรุณากรอกรหัสผ่าน";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSave(form);
  }

  const strength = form.password.length >= 16 && /[!@#$%^&*]/.test(form.password) ? 4 : form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="password-form-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[#343741] bg-[#202228] text-[#F2F3F5] shadow-2xl scrollbar-thin">
        <div className="flex items-center justify-between border-b border-[#343741] px-5 pb-4 pt-5"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#44487A] bg-[#2D3050]">{entry ? <Save className="h-4 w-4 text-[#B8B4FF]" /> : <Plus className="h-4 w-4 text-[#B8B4FF]" />}</div><h2 id="password-form-title" className="font-semibold">{entry ? "แก้ไขรหัสผ่าน" : "เพิ่มรหัสผ่านใหม่"}</h2></div><button type="button" onClick={onClose} className="rounded-md p-1.5 text-[#777B85] hover:bg-[#2A2D35] hover:text-white" aria-label="ปิดหน้าต่าง"><X className="h-4 w-4" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Field label="ชื่อเว็บไซต์" required error={errors.site}><input value={form.site} onChange={(event) => setField("site", event.target.value)} placeholder="เช่น GitHub, Google" className={`input-base ${errors.site ? "border-red-400" : ""}`} /></Field>
          <Field label="URL"><input value={form.url} onChange={(event) => setField("url", event.target.value)} placeholder="เช่น github.com" className="input-base" /></Field>
          <Field label="อีเมล / ชื่อผู้ใช้" required error={errors.username}><input value={form.username} onChange={(event) => setField("username", event.target.value)} placeholder="user@example.com" className={`input-base ${errors.username ? "border-red-400" : ""}`} /></Field>
          <Field label="รหัสผ่าน" required error={errors.password}>
            <div className="relative"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setField("password", event.target.value)} placeholder="กรอกหรือสุ่มรหัสผ่าน" className={`input-base pr-20 ${errors.password ? "border-red-400" : ""}`} /><div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1"><button type="button" onClick={() => setField("password", generatePassword())} className="rounded-md p-1.5 text-[#777B85] hover:bg-[#2A2D35] hover:text-[#B8B4FF]" aria-label="สุ่มรหัสผ่าน"><RefreshCw className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-md p-1.5 text-[#777B85] hover:bg-[#2A2D35] hover:text-[#B8B4FF]" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div></div>
            {form.password && <div className="mt-2 flex gap-1">{[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 flex-1 rounded-full ${level <= strength ? (strength === 4 ? "bg-green-500" : strength === 3 ? "bg-yellow-400" : strength === 2 ? "bg-orange-400" : "bg-red-400") : "bg-[#343741]"}`} />)}</div>}
          </Field>
          <Field label="หมวดหมู่"><select value={form.category} onChange={(event) => setField("category", event.target.value)} className="input-base">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Field>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 rounded-md border border-[#3A3D48] py-3 text-sm font-medium text-[#B8BBC3] hover:bg-[#2A2D35]">ยกเลิก</button><button type="submit" className="btn-primary flex-1 rounded-md py-3 text-sm font-semibold">{entry ? "บันทึกการแก้ไข" : "บันทึก"}</button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-[#B8BBC3]">{label}{required && <span className="text-red-400"> *</span>}</label>{children}{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>;
}
