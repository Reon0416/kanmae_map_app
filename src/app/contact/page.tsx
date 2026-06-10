export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
      <h1 className="text-2xl font-black">お問い合わせ</h1>
      <form className="mt-5 grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
        <input placeholder="お名前" className="h-11 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-slate-950" />
        <input placeholder="メールアドレス" className="h-11 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-slate-950" />
        <textarea placeholder="内容" className="min-h-32 rounded-md border border-border bg-muted px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-950" />
        <button type="button" className="h-10 rounded-md bg-slate-950 px-4 text-sm font-bold text-white">送信</button>
      </form>
    </main>
  );
}
