"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // อีเมล หรือ ชื่อผู้ใช้
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend accepts either an email or a username in the same field
        // (see lib/repo.ts findUserByIdentifier).
        body: JSON.stringify({ identifier, masterPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #3b0764 0%, #6d28d9 40%, #7c3aed 70%, #a855f7 100%)",
      }}
    >
      {/* ── Decorative blobs ── */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #c4b5fd, transparent)",
          transform: "translate(-35%, -35%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #818cf8, transparent)",
          transform: "translate(35%, 35%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #e879f9, transparent)" }}
      />

      {/* ── Floating dots ── */}
      {[
        { size: 6,  top: "12%", left: "8%",  delay: "0s" },
        { size: 10, top: "25%", left: "22%", delay: "0.6s" },
        { size: 8,  top: "60%", left: "5%",  delay: "1s" },
        { size: 12, top: "75%", left: "20%", delay: "0.3s" },
        { size: 6,  top: "15%", right: "10%", delay: "0.8s" },
        { size: 10, top: "70%", right: "8%",  delay: "0.5s" },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/20 animate-pulse pointer-events-none"
          style={{
            width: dot.size,
            height: dot.size,
            top: dot.top,
            left: "left" in dot ? dot.left : undefined,
            right: "right" in dot ? dot.right : undefined,
            animationDelay: dot.delay,
          }}
        />
      ))}

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SecureVault</h1>
            <p className="text-gray-500 text-sm mt-1">
              ลงชื่อเข้าใช้เพื่อเข้าถึงรหัสผ่านของคุณ
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  อีเมล หรือ ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="กรอกอีเมลหรือชื่อผู้ใช้ของคุณ"
                  autoComplete="username"
                  className="input-base"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านหลัก"
                    autoComplete="current-password"
                    className="input-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors p-1"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <span className="text-base">⚠️</span>
                  {error}
                </div>
              )}

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-violet-600"
                  />
                  จำฉันไว้
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-violet-600 hover:text-violet-800 font-medium"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading
                    ? "#a78bfa"
                    : "linear-gradient(135deg, #7c3aed, #a855f7)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    เข้าสู่ระบบ
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-xs text-gray-400">หรือ</span>
              <hr className="flex-1 border-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              ยังไม่มีบัญชี?{" "}
              <button type="button" onClick={() => router.push("/register")} className="text-violet-600 font-semibold hover:underline">
                สมัครสมาชิกฟรี
              </button>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/50 text-xs mt-5 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          ข้อมูลของคุณถูกเข้ารหัสด้วย AES-256
        </p>
      </div>
    </div>
  );
}