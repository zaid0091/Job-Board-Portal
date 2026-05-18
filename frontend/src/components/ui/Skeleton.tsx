interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton rounded-lg bg-gradient-to-r from-surface-100 via-surface-50 to-surface-100 dark:from-surface-200 dark:via-surface-100 dark:to-surface-200 bg-[length:200%_100%] ${className}`}
    />
  );
}

export function SkeletonText({ className = '', lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonBadge({ className = 'h-5 w-16' }: SkeletonProps) {
  return <Skeleton className={`rounded-md ${className}`} />;
}

/* ── Job Card skeleton ── */
export function JobCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-ink-900/[0.06] bg-card p-5 sm:p-6 dark:border-white/[0.08]"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3.5 w-2/5" />
        </div>
        <Skeleton className="hidden h-6 w-20 rounded-lg sm:block" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-ink-900/[0.04] pt-4 dark:border-white/[0.06]">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/* ── Stat card skeleton ── */
export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}

/* ── Job Detail page skeleton ── */
export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-page">
      <div className="relative -mt-14 border-b border-ink-900/[0.04] dark:border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28">
          <Skeleton className="h-4 w-32" />
          <div className="mt-6 flex gap-4">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-4/5 max-w-md" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <SkeletonBadge className="h-7 w-20" />
            <SkeletonBadge className="h-7 w-16" />
            <SkeletonBadge className="h-7 w-24" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink-900/[0.06] bg-card p-6 sm:p-8"
                style={{ boxShadow: 'var(--card-shadow-md)' }}
              >
                <Skeleton className="mb-5 h-8 w-28" />
                <SkeletonText lines={5} />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div
              className="rounded-2xl border border-ink-900/[0.06] bg-card p-6"
              style={{ boxShadow: 'var(--card-shadow-md)' }}
            >
              <Skeleton className="mb-4 h-8 w-20" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBadge className="h-6 w-16" />
                <SkeletonBadge className="h-6 w-20" />
                <SkeletonBadge className="h-6 w-14" />
              </div>
            </div>
            <div
              className="rounded-2xl border border-ink-900/[0.06] bg-card p-6"
              style={{ boxShadow: 'var(--card-shadow-md)' }}
            >
              <Skeleton className="mb-4 h-8 w-16" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard skeleton ── */
export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
            <Skeleton className="h-4 w-32 mb-6" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl p-6 space-y-4" style={{ boxShadow: 'var(--card-shadow-md)' }}>
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <SkeletonBadge className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Applications list skeleton ── */
export function ApplicationsListSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-5 flex items-center gap-4" style={{ boxShadow: 'var(--card-shadow)' }}>
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3.5 w-1/4" />
            </div>
            <SkeletonBadge className="h-5 w-20 hidden sm:block" />
            <Skeleton className="h-3.5 w-16 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
