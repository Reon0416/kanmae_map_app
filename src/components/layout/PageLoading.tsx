export function PageLoading() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 pb-24 pt-8" role="status" aria-label="読み込み中" aria-busy="true">
      <div className="mx-auto max-w-4xl motion-safe:animate-pulse" aria-hidden="true">
        <div className="mb-6 h-7 w-32 rounded bg-slate-200" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-slate-200 py-4">
            <div className="size-[72px] shrink-0 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
