"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { CURRENT_LEGAL_VERSION, LEGAL_ACCEPTANCE_STORAGE_KEY } from "@/constants/legal";

const legalPaths = new Set(["/terms", "/privacy"]);
const gatedUserPaths = ["/", "/filters", "/stores", "/record", "/my"];
type AcceptanceStatus = "checking" | "accepted" | "pending";

type LegalGateProps = {
  children: ReactNode;
};

function matchesUserPath(pathname: string) {
  return gatedUserPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
}

export function LegalGate({ children }: LegalGateProps) {
  const pathname = usePathname();
  const [acceptanceState, setAcceptanceState] = useState<{ pathname: string; status: AcceptanceStatus }>({
    pathname: "",
    status: "checking"
  });
  const [isChecked, setIsChecked] = useState(false);
  const isLegalPage = legalPaths.has(pathname);
  const isGatedUserPage = matchesUserPath(pathname);
  const acceptanceStatus = acceptanceState.pathname === pathname ? acceptanceState.status : "checking";

  useEffect(() => {
    if (isLegalPage || !isGatedUserPage) {
      setAcceptanceState({ pathname, status: "accepted" });
      return;
    }

    const acceptedVersion = window.localStorage.getItem(LEGAL_ACCEPTANCE_STORAGE_KEY);
    setAcceptanceState({
      pathname,
      status: acceptedVersion === CURRENT_LEGAL_VERSION ? "accepted" : "pending"
    });
  }, [isGatedUserPage, isLegalPage, pathname]);

  function acceptLegalDocuments() {
    window.localStorage.setItem(LEGAL_ACCEPTANCE_STORAGE_KEY, CURRENT_LEGAL_VERSION);
    setAcceptanceState({ pathname, status: "accepted" });
  }

  if (isLegalPage || !isGatedUserPage || acceptanceStatus === "accepted") {
    return children;
  }

  if (acceptanceStatus === "checking") {
    return null;
  }

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-slate-950/72 px-4 py-6 backdrop-blur-sm">
        <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-700">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Before Start</p>
              <h1 className="mt-1 text-xl font-black leading-tight text-slate-950">KANMAEをはじめる前に</h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            KANMAEでは、店舗の混雑状況、待ち時間目安、来店記録、スタンプ機能を提供します。来店記録の保存時には、店舗付近にいるかを確認するために位置情報を利用することがあります。
          </p>

          <div className="mt-5 grid gap-2">
            <Link
              href="/terms"
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <FileText className="size-4 text-orange-600" aria-hidden="true" />
                利用規約を読む
              </span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-orange-600" aria-hidden="true" />
                プライバシーポリシーを読む
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-800">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(event) => setIsChecked(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-orange-600"
            />
            <span>利用規約とプライバシーポリシーを確認し、内容に同意します。</span>
          </label>

          <button
            type="button"
            disabled={!isChecked}
            onClick={acceptLegalDocuments}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            同意してはじめる
          </button>
        </section>
      </div>
    </>
  );
}
