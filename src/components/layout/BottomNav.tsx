"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock3, Home, Map, PenLine, Settings, ShieldCheck, Store, User } from "lucide-react";
import { OPEN_STORE_DETAIL_RECORD_EVENT } from "@/features/visit-records/record-events";
import { prefetchMyPageStamps } from "@/features/visit-records/stamp-prefetch";
import { USER_ROLE, type UserRole } from "@/features/auth/roles";
import { cn } from "@/lib/utils";

export const TOGGLE_MAP_BOTTOM_NAV_EVENT = "kanmae:toggle-map-bottom-nav";
export const SET_MAP_BOTTOM_NAV_HIDDEN_EVENT = "kanmae:set-map-bottom-nav-hidden";

const itemsByRole = {
  store: [
    { href: "/store-admin", label: "店舗", icon: Store },
    { href: "/store-admin/settings", label: "設定", icon: Settings }
  ],
  admin: [
    { href: "/admin", label: "ホーム", icon: Home },
    { href: "/admin/wait-times", label: "待ち時間", icon: Clock3 },
    { href: "/admin/stores", label: "店舗", icon: ShieldCheck },
    { href: "/admin/settings", label: "設定", icon: Settings }
  ]
} as const;

const userNavItems = [
  { href: "/", label: "マップ", icon: Map },
  { href: "/stores", label: "店舗", icon: Store },
  { href: "/record", label: "記録", icon: PenLine, featured: true },
  { href: "/my", label: "自分", icon: User }
] as const;

function getUserItem(href: (typeof userNavItems)[number]["href"]) {
  return userNavItems.find((item) => item.href === href) ?? userNavItems[0];
}

function getUserItems(pathname: string) {
  if (pathname.startsWith("/stores/") && pathname !== "/stores") {
    return [getUserItem("/"), getUserItem("/record"), getUserItem("/my")];
  }

  if (pathname === "/my") {
    return [getUserItem("/stores"), getUserItem("/record"), getUserItem("/")];
  }

  const currentHref = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;
  return userNavItems.filter((item) => item.href !== currentHref);
}

function getPathRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) {
    return USER_ROLE.ADMIN;
  }

  if (pathname.startsWith("/store-admin")) {
    return USER_ROLE.STORE;
  }

  return null;
}

export function BottomNav() {
  const [isMapNavHidden, setIsMapNavHidden] = useState(false);
  const pathname = usePathname();
  const role = getPathRole(pathname) ?? USER_ROLE.USER;
  const isMapPage = pathname === "/";
  const isStoreDetailPage = pathname.startsWith("/stores/") && pathname !== "/stores";

  useEffect(() => {
    setIsMapNavHidden(false);
  }, [pathname]);

  useEffect(() => {
    const toggleMapNav = () => {
      if (window.location.pathname === "/") {
        setIsMapNavHidden((current) => !current);
      }
    };

    const setMapNavHidden = (event: Event) => {
      if (window.location.pathname !== "/") return;
      setIsMapNavHidden(Boolean((event as CustomEvent<{ hidden?: boolean }>).detail?.hidden));
    };

    window.addEventListener(TOGGLE_MAP_BOTTOM_NAV_EVENT, toggleMapNav);
    window.addEventListener(SET_MAP_BOTTOM_NAV_HIDDEN_EVENT, setMapNavHidden);
    return () => {
      window.removeEventListener(TOGGLE_MAP_BOTTOM_NAV_EVENT, toggleMapNav);
      window.removeEventListener(SET_MAP_BOTTOM_NAV_HIDDEN_EVENT, setMapNavHidden);
    };
  }, []);

  const items = role === USER_ROLE.USER ? getUserItems(pathname) : itemsByRole[role];
  const canPrefetchMyPage = items.some((item) => item.href === "/my");
  const myPagePrefetchHandlers = {
    onFocus: prefetchMyPageStamps,
    onPointerDown: prefetchMyPageStamps,
    onPointerEnter: prefetchMyPageStamps,
    onTouchStart: prefetchMyPageStamps
  };

  useEffect(() => {
    if (!canPrefetchMyPage) return;
    const timeout = window.setTimeout(prefetchMyPageStamps, 3500);
    return () => window.clearTimeout(timeout);
  }, [canPrefetchMyPage, pathname]);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white transition-transform duration-300 ease-out",
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
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={featuredClassName}
              >
                {featuredContent}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-600"
              {...(item.href === "/my" ? myPagePrefetchHandlers : {})}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
