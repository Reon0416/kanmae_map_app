import { AuthForm } from "@/components/auth/AuthForm";
import { ensureProfileAndGetRole, getRoleHomePath } from "@/features/auth/auth-server";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getSafeRedirectPath(next?: string) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/my";
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
      redirect(redirectTo === "/my" ? getRoleHomePath(role) : redirectTo);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-6">
          <p className="text-sm font-black tracking-[0.22em] text-slate-500">KANMAE</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">新規アカウント作成</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            メールアドレスとパスワードを登録して、来店回数とスタンプを保存します。
          </p>
        </div>
        <AuthForm mode="sign-up" redirectTo={redirectTo} />
        <p className="mt-5 text-xs leading-6 text-slate-500">
          パスワードは Supabase Auth 側で安全に管理され、アプリのテーブルには保存しません。
        </p>
      </section>
    </main>
  );
}
