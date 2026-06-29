/**
 * FeedSkeleton — animated placeholder grid shown while the news feed loads.
 *
 * Matches the layout of the ArticleFeedCard grid so the page doesn't jump
 * when real content arrives.
 *
 * Layer: interfaces.
 */

interface Props {
  /** Number of skeleton cards to render. Defaults to 20. */
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Thumbnail placeholder */}
      <div className="h-44 w-full animate-pulse bg-slate-200" />
      {/* Body placeholder */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
        {/* Description */}
        <div className="space-y-1">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        </div>
        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 20 }: Props) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading articles…"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
