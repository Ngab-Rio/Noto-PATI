export default function Loading() {
  return (
    <section
      className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Halaman sedang dimuat</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-8 w-56 rounded-md bg-primary-soft" />
        <div className="h-4 max-w-2xl rounded bg-border/70" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-52 rounded-xl border border-border bg-surface" />
          <div className="h-52 rounded-xl border border-border bg-surface" />
          <div className="h-52 rounded-xl border border-border bg-surface" />
        </div>
      </div>
    </section>
  );
}
