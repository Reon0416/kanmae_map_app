"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

const noChromePaths = new Set(["/login"]);

export function AppChrome() {
  const pathname = usePathname();

  if (noChromePaths.has(pathname)) {
    return null;
  }

  return (
    <>
      <BottomNav />
    </>
  );
}
