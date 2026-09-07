"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name || !username || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
      setError("ชื่อผู้ใช้ต้องมี 3-20 ตัวอักษร (a-z, 0-9, _ หรือ .)");
      return;
    }
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (!agreed) {
      setError("กรุณายอมรับข้อตกลงการใช้งานก่อนสมัครสมาชิก");
      return;
    }

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
        setLoading(false);
        return;
      }
      router.push("/vault");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="สร้างบัญชี" description="สร้างบัญชี SecureVault เพื่อเริ่มจัดเก็บข้อมูลเข้าสู่ระบบอย่างปลอดภัย">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#C5C7CE]">ชื่อ-นามสกุล</label>
            <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="ชื่อของคุณ" autoComplete="name" className="input-base h-11 rounded-lg px-4" />
          </div>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#C5C7CE]">ชื่อผู้ใช้</label>
            <input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username" autoComplete="username" className="input-base h-11 rounded-lg px-4" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#C5C7CE]">อีเมล</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" className="input-base h-11 rounded-lg px-4" />
        </div>

        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#C5C7CE]">Master Password</label>
          <div className="relative">
            <input id="new-password" type={showPw ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" autoComplete="new-password" className="input-base h-11 rounded-lg px-4 pr-11" />
            <button type="button" onClick={() => setShowPw((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#777B85] hover:bg-[#2B2E36] hover:text-white" aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 grid grid-cols-4 gap-1" aria-label="ระดับความแข็งแรงของรหัสผ่าน">
              {[1, 2, 3, 4].map((level) => {
                const strength = password.length >= 16 && /[!@#$%^&*]/.test(password) ? 4 : password.length >= 12 ? 3 : password.length >= 8 ? 2 : 1;
                return <span key={level} className={`h-1 rounded-full ${level <= strength ? (strength >= 4 ? "bg-[#49C68A]" : strength >= 3 ? "bg-[#E6B85C]" : strength >= 2 ? "bg-[#DA8754]" : "bg-[#E6636E]") : "bg-[#30323B]"}`} />;
              })}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#C5C7CE]">ยืนยัน Master Password</label>
          <div className="relative">
            <input id="confirm-password" type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="กรอกรหัสผ่านอีกครั้ง" autoComplete="new-password" className="input-base h-11 rounded-lg px-4 pr-11" />
            <button type="button" onClick={() => setShowConfirmPw((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#777B85] hover:bg-[#2B2E36] hover:text-white" aria-label={showConfirmPw ? "ซ่อนรหัสผ่านยืนยัน" : "แสดงรหัสผ่านยืนยัน"}>
              {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2 pt-1 text-sm leading-5 text-[#92959F]">
          <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#554CFF]" />
          <span>ฉันยอมรับ <button type="button" className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">ข้อตกลงการใช้งาน</button> และ <button type="button" className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">นโยบายความเป็นส่วนตัว</button></span>
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#65333A] bg-[#2A1D21] px-3 py-2.5 text-sm text-[#FF9AA4]">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#554CFF] text-sm font-semibold text-white transition hover:bg-[#675FFF] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
        </button>
      </form>

      <div className="mt-6 border-t border-[#2B2D35] pt-6 text-center text-sm text-[#858994]">
        มีบัญชีอยู่แล้ว?{" "}
        <button type="button" onClick={() => router.push("/login")} className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">เข้าสู่ระบบ</button>
      </div>
    </AuthShell>
  );
}
