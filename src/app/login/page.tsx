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

export default async function LoginPage({
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
      <section className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-md items-center">
        <div className="mx-auto w-full max-w-md">
          <AuthForm mode="sign-in" redirectTo={redirectTo} />
        </div>
      </section>
    </main>
  );
}
