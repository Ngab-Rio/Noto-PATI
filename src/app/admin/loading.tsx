export default function AdminLoading() {
  return (
    <section
      className="mx-auto min-h-[60vh] max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Halaman admin sedang dimuat</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="space-y-2 border-b border-border/70 pb-5">
          <div className="h-7 w-72 rounded-md bg-primary-soft" />
          <div className="h-4 max-w-2xl rounded bg-border/70" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-72 rounded-xl border border-border bg-surface" />
      </div>
    </section>
  );
}
