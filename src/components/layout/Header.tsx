import Link from "next/link";
import { LogIn, MapPinned } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-wide text-slate-950">
          <span className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
            <MapPinned className="size-5" aria-hidden="true" />
          </span>
          KANMAE
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/favorites" className="hover:text-slate-950">お気に入り</Link>
          <Link href="/my" className="hover:text-slate-950">マイページ</Link>
          <Link href="/store-admin/status" className="hover:text-slate-950">店舗管理</Link>
          <Link href="/admin/stores" className="hover:text-slate-950">運営管理</Link>
          <Link href="/login" className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-3 py-2 text-white hover:text-white">
            <LogIn className="size-4" aria-hidden="true" />
            ログイン
          </Link>
        </nav>
      </div>
    </header>
  );
}
