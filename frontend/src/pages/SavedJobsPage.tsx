import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '@/api/jobsAPI';
import { BriefcaseIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import SEO from '@/components/SEO';
import EmptyState from '@/components/ui/EmptyState';

interface SavedJobItem {
  id: string;
  job: {
    id: string;
    title: string;
    slug: string;
    employer_name: string;
    employer_logo: string | null;
    category_name: string | null;
    job_type: string;
    experience_level: string;
    location: string;
    is_remote: boolean;
    salary_display: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    applications_count: number;
    days_remaining: number | null;
    is_saved: boolean;
    created_at: string;
  };
  created_at: string;
}

interface SavedJobsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: SavedJobItem[];
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSavedJobs = async (p: number) => {
    try {
      const res: SavedJobsResponse = await jobsAPI.getSavedJobs(p);
      setSavedJobs((prev) => (p === 1 ? res.results : [...prev, ...res.results]));
      setTotalCount(res.count);
      setHasMore(!!res.next);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs(1);
  }, []);

  const handleUnsave = async (savedJobId: string) => {
    try {
      await jobsAPI.unsaveJob(savedJobId);
      setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      setTotalCount((prev) => prev - 1);
    } catch {
      // silently fail
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSavedJobs(nextPage);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-5 animate-pulse"
              style={{ boxShadow: 'var(--card-shadow)' }}
            >
              <div className="h-5 w-48 bg-surface-200 rounded mb-3" />
              <div className="h-4 w-32 bg-surface-200 rounded mb-2" />
              <div className="h-4 w-24 bg-surface-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <SEO title="Saved Jobs" description="Jobs you have bookmarked for later." />
        <EmptyState
          title="No saved jobs"
          description="Browse jobs and bookmark positions you're interested in."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title="Saved Jobs" description="Jobs you have bookmarked for later." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm text-ink-900">Saved Jobs</h1>
          <p className="text-sm text-ink-400 mt-1">
            {totalCount} saved job{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">
          Browse more
        </Link>
      </div>

      <div className="grid gap-4">
        {savedJobs.map((saved) => {
          const job = saved.job;
          return (
            <div
              key={saved.id}
              className="bg-card rounded-xl p-5 transition-all duration-200 ease-spring hover:shadow-md"
              style={{ boxShadow: 'var(--card-shadow)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <Link to={`/jobs/${job.slug}`} className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-ink-800 hover:text-primary-600 transition-colors truncate">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-sm text-ink-400">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      {job.employer_name}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-ink-400">
                      <MapPinIcon className="h-4 w-4" />
                      {job.is_remote ? 'Remote' : job.location}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-ink-400">
                      <BriefcaseIcon className="h-4 w-4" />
                      {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-[13px] font-medium text-ink-600">
                      {job.salary_display}
                    </span>
                    {job.days_remaining !== null && job.days_remaining < 0 && (
                      <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Expired
                      </p>
                    )}
                    {job.days_remaining !== null && job.days_remaining === 0 && (
                      <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Expires today
                      </p>
                    )}
                    {job.days_remaining !== null && job.days_remaining > 0 && job.days_remaining <= 7 && (
                      <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Expires in {job.days_remaining} day{job.days_remaining > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleUnsave(saved.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-primary-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove from saved"
                >
                  <BookmarkSolidIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button onClick={handleLoadMore} className="btn-secondary text-sm">
            Load more
          </button>
        </div>
      )}

      {!hasMore && savedJobs.length > 0 && (
        <p className="mt-8 text-center text-[13px] text-ink-300">
          You&apos;ve seen all {totalCount} saved jobs
        </p>
      )}
    </div>
  );
}
