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
    <div className="rounded-xl p-5 bg-card" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3.5 w-2/5" />
        </div>
        <Skeleton className="hidden sm:block h-5 w-20 rounded-md" />
      </div>
      <div className="mt-3.5 flex flex-wrap gap-3">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="bg-card rounded-2xl p-6 sm:p-8 space-y-5" style={{ boxShadow: 'var(--card-shadow-md)' }}>
        <div className="space-y-3">
          <Skeleton className="h-7 w-3/5" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBadge className="h-5 w-20" />
          <SkeletonBadge className="h-5 w-16" />
          <SkeletonBadge className="h-5 w-24" />
          <SkeletonBadge className="h-5 w-28" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-6 space-y-4" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <Skeleton className="h-4 w-24" />
              <SkeletonText lines={5} />
            </div>
          ))}
        </div>
        <div>
          <div className="bg-card rounded-2xl p-6 space-y-4" style={{ boxShadow: 'var(--card-shadow-md)' }}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <SkeletonText lines={3} />
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
