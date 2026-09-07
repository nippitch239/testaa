import { useState } from "react";

import { CircleAlert, Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { navigate } from "../navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const { name, username, email, password, confirmPassword } = form;
    if (!name || !username || !email || !password || !confirmPassword) return setError("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return setError("ชื่อผู้ใช้ต้องมี 3-20 ตัวอักษร (a-z, 0-9, _ หรือ .)");
    if (password.length < 8) return setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (password !== confirmPassword) return setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    if (!agreed) return setError("กรุณายอมรับข้อตกลงการใช้งานก่อนสมัครสมาชิก");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, masterPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "สมัครสมาชิกไม่สำเร็จ");
        return;
      }
      navigate("/vault");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  const strength = form.password.length >= 16 && /[!@#$%^&*]/.test(form.password) ? 4 : form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : 1;
  const fields = [
    { key: "name", label: "ชื่อ-นามสกุล", placeholder: "ชื่อของคุณ", autoComplete: "name" },
    { key: "username", label: "ชื่อผู้ใช้", placeholder: "username", autoComplete: "username" },
  ];

  return (
    <AuthShell title="สร้างบัญชี" description="สร้างบัญชี SecureVault เพื่อเริ่มจัดเก็บข้อมูลเข้าสู่ระบบอย่างปลอดภัย">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => <div key={field.key}><label htmlFor={field.key} className="mb-2 block text-sm font-medium text-[#C5C7CE]">{field.label}</label><input id={field.key} value={form[field.key]} onChange={(event) => setField(field.key, event.target.value)} placeholder={field.placeholder} autoComplete={field.autoComplete} className="input-base h-11 rounded-lg px-4" /></div>)}
        </div>
        <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-[#C5C7CE]">อีเมล</label><input id="email" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="name@example.com" autoComplete="email" className="input-base h-11 rounded-lg px-4" /></div>
        <PasswordInput id="new-password" label="Master Password" value={form.password} onChange={(value) => setField("password", value)} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} placeholder="อย่างน้อย 8 ตัวอักษร" />
        {form.password && <div className="grid grid-cols-4 gap-1" aria-label="ระดับความแข็งแรงของรหัสผ่าน">{[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 rounded-full ${level <= strength ? (strength >= 4 ? "bg-[#49C68A]" : strength >= 3 ? "bg-[#E6B85C]" : strength >= 2 ? "bg-[#DA8754]" : "bg-[#E6636E]") : "bg-[#30323B]"}`} />)}</div>}
        <PasswordInput id="confirm-password" label="ยืนยัน Master Password" value={form.confirmPassword} onChange={(value) => setField("confirmPassword", value)} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} placeholder="กรอกรหัสผ่านอีกครั้ง" />
        <label className="flex cursor-pointer items-start gap-2 pt-1 text-sm leading-5 text-[#92959F]"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#554CFF]" /><span>ฉันยอมรับ <button type="button" className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">ข้อตกลงการใช้งาน</button> และ <button type="button" className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">นโยบายความเป็นส่วนตัว</button></span></label>
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#65333A] bg-[#2A1D21] px-3 py-2.5 text-sm text-[#FF9AA4]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#554CFF] text-sm font-semibold text-white transition hover:bg-[#675FFF] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}</button>
      </form>
      <div className="mt-6 border-t border-[#2B2D35] pt-6 text-center text-sm text-[#858994]">มีบัญชีอยู่แล้ว? <button type="button" onClick={() => navigate("/login")} className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">เข้าสู่ระบบ</button></div>
    </AuthShell>
  );
}

function PasswordInput({ id, label, value, onChange, visible, onToggle, placeholder }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-[#C5C7CE]">{label}</label><div className="relative"><input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="new-password" className="input-base h-11 rounded-lg px-4 pr-11" /><button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#777B85] hover:bg-[#2B2E36] hover:text-white" aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>;
}
