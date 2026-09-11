import { AuthForm } from "@/components/auth/AuthForm";
import { ensureProfileAndGetRole, getPostAuthRedirectPath } from "@/features/auth/auth-server";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getSafeRedirectPath(next?: string) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = getSafeRedirectPath(next);

  if (hasSupabaseEnvironment()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const role = await ensureProfileAndGetRole(supabase, user);
      redirect(getPostAuthRedirectPath(role, redirectTo));
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#ecfdf5_0,#f8fafc_34%,#e2e8f0_100%)] px-4 py-6">
      <section className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <div className="max-w-lg">
            <p className="text-sm font-black tracking-[0.32em] text-emerald-700">KANMAE</p>
            <h1 className="mt-4 text-6xl font-black leading-[0.95] tracking-normal text-slate-950">関前を<br />もっと軽く。</h1>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {["MAP", "STAMP", "WAIT"].map((item) => (
                <div key={item} className="border border-white/70 bg-white/75 px-4 py-5 shadow-sm backdrop-blur">
                  <p className="text-xs font-black tracking-[0.18em] text-slate-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-5">
            <p className="text-sm font-black tracking-[0.28em] text-emerald-700 lg:hidden">KANMAE</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-950">新規登録</h1>
          </div>
          <AuthForm mode="sign-up" redirectTo={redirectTo} />
        </div>
      </section>
    </main>
  );
}
