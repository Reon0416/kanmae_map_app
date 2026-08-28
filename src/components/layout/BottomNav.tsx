"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Map, PenLine, Settings, ShieldCheck, Store, User } from "lucide-react";
import { OPEN_STORE_DETAIL_RECORD_EVENT } from "@/components/stores/StoreDetailRecordSheet";
import { ROLE_STORAGE_KEY, USER_ROLE, type UserRole } from "@/features/auth/roles";
import { cn } from "@/lib/utils";

export const TOGGLE_MAP_BOTTOM_NAV_EVENT = "kanmae:toggle-map-bottom-nav";

const itemsByRole = {
  store: [
    { href: "/store-admin", label: "ホーム", icon: Home },
    { href: "/store-admin/status", label: "状況", icon: Store },
    { href: "/store-admin/settings", label: "設定", icon: Settings },
    { href: "/login", label: "切替", icon: User }
  ],
  admin: [
    { href: "/admin", label: "ホーム", icon: Home },
    { href: "/admin/stores", label: "店舗", icon: ShieldCheck },
    { href: "/admin/reports", label: "報告", icon: ClipboardList },
    { href: "/login", label: "切替", icon: User }
  ]
} as const;

const userNavItems = [
  { href: "/", label: "マップ", icon: Map },
  { href: "/stores", label: "店舗", icon: Store },
  { href: "/record", label: "記録", icon: PenLine, featured: true },
  { href: "/my", label: "自分", icon: User }
] as const;

function getUserItems(pathname: string) {
  if (pathname.startsWith("/stores/") && pathname !== "/stores") {
    return userNavItems.filter((item) => item.href === "/" || item.href === "/my");
  }

  if (pathname === "/my") {
    return userNavItems.filter((item) => item.href === "/stores" || item.href === "/record" || item.href === "/");
  }

  const currentHref = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;
  return userNavItems.filter((item) => item.href !== currentHref);
}

export function BottomNav() {
  const [role, setRole] = useState<UserRole>(USER_ROLE.USER);
  const [isMapNavHidden, setIsMapNavHidden] = useState(false);
  const pathname = usePathname();
  const isMapPage = pathname === "/";
  const isStoreDetailPage = pathname.startsWith("/stores/") && pathname !== "/stores";

  useEffect(() => {
    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (storedRole && storedRole in itemsByRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    setIsMapNavHidden(false);
  }, [pathname]);

  useEffect(() => {
    const toggleMapNav = () => {
      if (window.location.pathname === "/") {
        setIsMapNavHidden((current) => !current);
      }
    };

    window.addEventListener(TOGGLE_MAP_BOTTOM_NAV_EVENT, toggleMapNav);
    return () => window.removeEventListener(TOGGLE_MAP_BOTTOM_NAV_EVENT, toggleMapNav);
  }, []);

  const items = role === USER_ROLE.USER ? getUserItems(pathname) : itemsByRole[role];

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white transition-transform duration-300 ease-out md:hidden",
        isMapPage && isMapNavHidden && "translate-y-[calc(100%+2.5rem)]"
      )}
    >
      <div
        className={cn(
          "grid h-16",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "grid-cols-3",
          items.length === 4 && "grid-cols-4"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          if ("featured" in item && item.featured) {
            const featuredClassName = "-mt-8 flex flex-col items-center justify-center gap-1 text-xs font-black text-emerald-700";
            const featuredContent = (
              <>
                <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-panel ring-8 ring-white">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                {item.label}
              </>
            );

            if (isStoreDetailPage) {
              return (
                <button
                  key={item.href}
                  type="button"
                  className={featuredClassName}
                  onClick={() => window.dispatchEvent(new Event(OPEN_STORE_DETAIL_RECORD_EVENT))}
                >
                  {featuredContent}
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={featuredClassName}>
                {featuredContent}
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-600">
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
