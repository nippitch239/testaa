import { useState } from "react";

import { CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { navigate } from "../navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!identifier || !password) return setError("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (password.length < 6) return setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, masterPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      navigate("/vault");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="เข้าสู่ระบบ" description="ใช้ชื่อผู้ใช้หรืออีเมลเพื่อเข้าถึงคลังรหัสผ่านของคุณ">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-[#C5C7CE]">อีเมล หรือชื่อผู้ใช้</label>
          <input id="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="name@example.com" autoComplete="username" className="input-base h-11 rounded-lg px-4" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-sm font-medium text-[#C5C7CE]">Master Password</label>
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs font-medium text-[#9C97FF] hover:text-[#B8B4FF]">ลืมรหัสผ่าน?</button>
          </div>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="กรอกรหัสผ่านหลัก" autoComplete="current-password" className="input-base h-11 rounded-lg px-4 pr-11" />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#777B85] hover:bg-[#2B2E36] hover:text-white" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#92959F]">
          <input type="checkbox" className="h-4 w-4 rounded accent-[#554CFF]" /> จำฉันไว้
        </label>
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#65333A] bg-[#2A1D21] px-3 py-2.5 text-sm text-[#FF9AA4]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#554CFF] text-sm font-semibold text-white transition hover:bg-[#675FFF] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
      <div className="mt-6 border-t border-[#2B2D35] pt-6 text-center text-sm text-[#858994]">
        ยังไม่มีบัญชี? <button type="button" onClick={() => navigate("/register")} className="font-medium text-[#9C97FF] hover:text-[#B8B4FF]">สร้างบัญชี</button>
      </div>
    </AuthShell>
  );
}
