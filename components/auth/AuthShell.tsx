import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthShell({ children, title, description }: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-[#17191F] text-[#F2F3F5]">
      <header className="flex h-20 shrink-0 items-center gap-3 border-b border-[#22242C] px-5 sm:px-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F7] text-[#11131A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">SecureVault</p>
          <p className="text-xs text-[#777B85]">Password manager</p>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8D86FF]">Secure access</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F4F5F7] sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#858994]">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
