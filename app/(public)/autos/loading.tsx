export default function Loading() {
  return (
    <div className="container py-12">
      <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-14 w-2/3 animate-pulse rounded bg-secondary" />
      <div className="mt-10 h-24 animate-pulse rounded-xl bg-secondary" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[380px] animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
