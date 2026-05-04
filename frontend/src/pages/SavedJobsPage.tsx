import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '@/api/jobsAPI';
import SEO from '@/components/SEO';
import EmptyState from '@/components/ui/EmptyState';
import SavedJobCard from '@/components/saved-jobs/SavedJobCard';

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

  const handleUnsave = useCallback(async (savedJobId: string) => {
    try {
      await jobsAPI.unsaveJob(savedJobId);
      setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      setTotalCount((prev) => prev - 1);
    } catch {
      // silently fail
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSavedJobs(nextPage);
  }, [page, fetchSavedJobs]);

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
        {savedJobs.map((saved, i) => (
          <SavedJobCard
            key={saved.id}
            saved={saved}
            index={i}
            onUnsave={handleUnsave}
          />
        ))}
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
