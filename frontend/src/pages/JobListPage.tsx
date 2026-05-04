import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/jobsSlice';
import { motion } from 'framer-motion';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import SEO from '@/components/SEO';
import useInfiniteJobs from '@/hooks/useInfiniteJobs';
import type { JobFilters as JobFiltersType } from '@/types';

export default function JobListPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setLocalFilters] = useState<Omit<JobFiltersType, 'page'>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { jobs, isLoading, isLoadingMore, hasMore, totalCount, loadMore } =
    useInfiniteJobs(filters);

  // Seed filters from URL on mount
  useEffect(() => {
    dispatch(fetchCategories());

    const params: Omit<JobFiltersType, 'page'> = {};
    const search = searchParams.get('search');
    const jobType = searchParams.get('job_type');
    const experienceLevel = searchParams.get('experience_level');
    const location = searchParams.get('location');
    const isRemote = searchParams.get('is_remote');
    const ordering = searchParams.get('ordering');

    if (search) params.search = search;
    if (jobType) params.job_type = jobType as JobFiltersType['job_type'];
    if (experienceLevel) params.experience_level = experienceLevel as JobFiltersType['experience_level'];
    if (location) params.location = location;
    if (isRemote === 'true') params.is_remote = true;
    if (ordering) params.ordering = ordering;

    setLocalFilters(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters → URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = useCallback((newFilters: Partial<JobFiltersType>) => {
    // Strip page — infinite scroll manages its own page
    const { page: _, ...rest } = newFilters;
    setLocalFilters((prev) => ({ ...prev, ...rest }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  // Intersection Observer — auto-load when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([_, value]) => value !== undefined && value !== '' && value !== false);
  }, [filters]);

  // Progress percentage for the bar
  const progress = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.min(100, (jobs.length / totalCount) * 100);
  }, [jobs.length, totalCount]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title="Jobs" description="Browse open positions and find your next career opportunity." />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
        <div>
          <h1 className="text-display-sm text-ink-900">Positions</h1>
          <p className="text-sm text-ink-400 mt-1">
            {totalCount} role{totalCount !== 1 ? 's' : ''} available
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-[13px] font-medium text-ink-500 hover:text-primary-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      <JobFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or search terms."
          action={
            <button onClick={handleClearFilters} className="btn-primary">
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i % 10, 5) * 0.04,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>

          {/* Progress bar + count */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-[13px] text-ink-400">
              Showing <span className="font-medium text-ink-600">{jobs.length}</span> of{' '}
              <span className="font-medium text-ink-600">{totalCount}</span> jobs
            </p>
            <div className="w-full max-w-xs h-1 rounded-full bg-surface-100 dark:bg-surface-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Loading more skeletons */}
          {isLoadingMore && (
            <div className="grid gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`skel-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                >
                  <JobCardSkeleton />
                </motion.div>
              ))}
            </div>
          )}

          {/* Manual load-more fallback */}
          {hasMore && !isLoadingMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-ink-600 hover:text-primary-600 bg-surface-50 hover:bg-primary-50 dark:bg-surface-100 dark:hover:bg-primary-950/30 transition-all duration-200"
              >
                Load more jobs
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* All loaded message */}
          {!hasMore && jobs.length > 0 && (
            <p className="mt-8 text-center text-[13px] text-ink-300">
              You&apos;ve seen all {totalCount} jobs
            </p>
          )}

          {/* Invisible sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
