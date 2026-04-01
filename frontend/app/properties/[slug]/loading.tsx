export default function PropertyLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-5 w-36 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="h-20 animate-pulse rounded-[2rem] bg-[color:var(--surface-strong)]" />
          <div className="aspect-[16/10] animate-pulse rounded-[2rem] bg-[color:var(--surface-strong)]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[1.75rem] bg-[color:var(--surface-strong)]"
              />
            ))}
          </div>
        </div>
        <div className="h-[32rem] animate-pulse rounded-[2rem] bg-[color:var(--surface-strong)]" />
      </div>
    </div>
  );
}

