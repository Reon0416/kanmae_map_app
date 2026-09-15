"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

const noChromePaths = new Set(["/login", "/signup", "/terms", "/privacy"]);

export function AppChrome() {
  const pathname = usePathname();

  if (noChromePaths.has(pathname) || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <BottomNav />
    </>
  );
}
