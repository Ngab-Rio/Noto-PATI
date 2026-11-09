export default function AdminMapLoading() {
  return (
    <section
      className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Peta laporan sedang dimuat</span>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="space-y-2 border-b border-border/70 pb-5">
          <div className="h-7 w-64 rounded-md bg-primary-soft" />
          <div className="h-4 max-w-3xl rounded bg-border/70" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="h-[min(64vh,640px)] min-h-96 rounded-xl bg-primary-soft/50" />
        </div>
        <div className="h-24 rounded-xl border border-border bg-surface" />
      </div>
    </section>
  );
}
