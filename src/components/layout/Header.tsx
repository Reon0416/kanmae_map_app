import Link from "next/link";
import { MapPinned } from "lucide-react";
import { MyPageLink } from "@/components/layout/MyPageLink";

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
          <MyPageLink className="hover:text-slate-950">マイページ</MyPageLink>
        </nav>
      </div>
    </header>
  );
}
