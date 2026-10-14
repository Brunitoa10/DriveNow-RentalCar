export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded bg-secondary" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-secondary" />
    </div>
  );
}
