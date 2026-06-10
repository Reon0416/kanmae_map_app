import { RoleLoginForm } from "@/components/auth/RoleLoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-6">
          <p className="text-sm font-black tracking-[0.22em] text-slate-500">KANMAE</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">ログイン種別を選択</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ユーザー、飲食店の店舗様、KANMAE運営者で表示する画面を分けます。
          </p>
        </div>
        <RoleLoginForm />
        <p className="mt-5 text-xs leading-6 text-slate-500">
          現在は開発用のロール選択です。本番では Supabase Auth で認証し、DB の RLS で権限を制御します。
        </p>
      </section>
    </main>
  );
}
