export default function AdminReportsLoading() {
  return (
    <section
      className="mx-auto min-h-[60vh] max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Daftar laporan sedang dimuat</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="space-y-2 border-b border-border/70 pb-5">
          <div className="h-7 w-72 rounded-md bg-primary-soft" />
          <div className="h-4 max-w-2xl rounded bg-border/70" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-48 rounded-lg bg-surface" />
          <div className="h-9 w-44 rounded-lg bg-surface" />
          <div className="h-9 w-36 rounded-lg bg-surface" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-24 rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
