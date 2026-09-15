import Link from "next/link";
import type { ReactNode } from "react";
import { Clock3, LayoutDashboard, Settings, ShieldCheck, Store, UserCircle } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/wait-times", label: "待ち時間管理", icon: Clock3 },
  { href: "/admin/stores", label: "店舗情報管理", icon: Store },
  { href: "/admin/settings", label: "設定", icon: Settings }
];

export function AdminShell({
  activePath,
  title,
  description,
  children
}: {
  activePath: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#f4f6f8] text-slate-950">
      <div className="grid min-h-dvh lg:grid-cols-[264px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="flex h-full flex-col px-4 py-4 lg:px-5 lg:py-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <span className="flex size-10 items-center justify-center rounded-md bg-white text-slate-950">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">KANMAE</p>
                <p className="text-sm font-black">運営管理</p>
              </div>
            </div>

            <nav className="mt-5 grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === activePath;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition",
                      active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-5 lg:mt-auto">
              <div className="mb-3 flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-3">
                <UserCircle className="size-5 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-slate-400">ログイン中</p>
                  <p className="text-sm font-black">運営者アカウント</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 bg-white px-4 py-5 md:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Operations Console</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                管理者のみアクセス可能
              </div>
            </div>
          </header>
          <div className="px-4 py-5 md:px-8 md:py-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
