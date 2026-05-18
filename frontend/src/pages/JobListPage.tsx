import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/jobsSlice';
import { motion } from 'framer-motion';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import JobListHero from '@/components/jobs/JobListHero';
import JobActiveFilterChips from '@/components/jobs/JobActiveFilterChips';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import PremiumCard from '@/components/ui/PremiumCard';
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
    const { page: _, ...rest } = newFilters;
    setLocalFilters((prev) => ({ ...prev, ...rest }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  const handleRemoveFilter = useCallback((key: keyof Omit<JobFiltersType, 'page'>) => {
    setLocalFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

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

  const progress = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.min(100, (jobs.length / totalCount) * 100);
  }, [jobs.length, totalCount]);

  return (
    <div className="min-h-screen bg-page">
      <SEO
        title="Browse Open Positions"
        description="Explore thousands of curated job listings across industries. Find remote, full-time, part-time, and contract positions."
        canonical="/jobs"
      />

      <JobListHero totalCount={totalCount} loadedCount={jobs.length} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start lg:gap-8 xl:gap-10">
          <aside className="mb-6 lg:sticky lg:top-20 lg:mb-0 lg:self-start">
            <JobFilters filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          <main className="min-w-0">
            <div className="mb-6 space-y-4">
              <JobActiveFilterChips
                filters={filters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearFilters}
              />
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <PremiumCard className="p-8 sm:p-12">
                <EmptyState
                  title="No jobs found"
                  description="Try adjusting your filters or search terms to discover more opportunities."
                  action={
                    <button type="button" onClick={handleClearFilters} className="btn-primary">
                      Clear filters
                    </button>
                  }
                />
              </PremiumCard>
            ) : (
              <>
                <div className="grid gap-4 sm:gap-5">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(i % 8, 6) * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <p className="text-center text-[13px] text-ink-500 dark:text-zinc-400">
                    Showing{' '}
                    <span className="font-semibold text-ink-800 dark:text-zinc-200">
                      {jobs.length}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-ink-800 dark:text-zinc-200">
                      {totalCount}
                    </span>{' '}
                    positions
                  </p>
                  <div className="relative h-1.5 w-full max-w-md overflow-hidden rounded-full bg-ink-900/[0.06] dark:bg-white/[0.08]">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {isLoadingMore && (
                  <div className="mt-5 grid gap-4">
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

                {hasMore && !isLoadingMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="group inline-flex items-center gap-2 rounded-xl border border-ink-900/[0.08] bg-white px-6 py-3 text-[13px] font-semibold text-ink-700 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-primary-800/50 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                    >
                      Load more positions
                      <ArrowDownIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                    </button>
                  </div>
                )}

                {!hasMore && jobs.length > 0 && (
                  <p className="mt-10 text-center text-[12px] font-medium uppercase tracking-[0.2em] text-ink-300 dark:text-zinc-600">
                    You&apos;ve viewed all {totalCount} listings
                  </p>
                )}

                <div ref={sentinelRef} className="h-px" aria-hidden="true" />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
