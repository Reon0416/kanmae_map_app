"use client";

import { useRouter } from "next/navigation";
import { Building2, Map, ShieldCheck } from "lucide-react";
import { ROLE_HOME_PATH, ROLE_LABELS, ROLE_STORAGE_KEY, USER_ROLE, type UserRole } from "@/features/auth/roles";
import { cn } from "@/lib/utils";

const roleOptions: {
  role: UserRole;
  title: string;
  description: string;
  icon: typeof Map;
}[] = [
  {
    role: USER_ROLE.USER,
    title: ROLE_LABELS.user,
    description: "マップで入りやすい飲食店を探し、来店記録を残します。",
    icon: Map
  },
  {
    role: USER_ROLE.STORE,
    title: ROLE_LABELS.store,
    description: "空席あり・残りわずか・満席の3択で店舗状況を更新します。",
    icon: Building2
  },
  {
    role: USER_ROLE.ADMIN,
    title: ROLE_LABELS.admin,
    description: "店舗情報、報告、表示状態を管理します。",
    icon: ShieldCheck
  }
];

export function RoleLoginForm() {
  const router = useRouter();

  function loginAs(role: UserRole) {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
    router.push(ROLE_HOME_PATH[role]);
  }

  return (
    <div className="grid gap-3">
      {roleOptions.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.role}
            type="button"
            className={cn(
              "flex min-h-24 items-center gap-4 rounded-lg border border-border bg-white p-4 text-left shadow-sm transition",
              "hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
            )}
            onClick={() => loginAs(option.role)}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-black text-slate-950">{option.title}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
