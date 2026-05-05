import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '@/api';
import { ApplicationsListSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import SEO from '@/components/SEO';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { ApplicationListItem, PaginatedResponse } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  REVIEWING: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  SHORTLISTED: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  INTERVIEW: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
  OFFERED: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  ACCEPTED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  WITHDRAWN: 'bg-surface-100 text-ink-500',
};

export default function MyApplicationsPage() {
  const [data, setData] = useState<PaginatedResponse<ApplicationListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchApps = (p: number) => {
    setLoading(true);
    applicationsAPI
      .getApplications(p)
      .then((res) => setData(res))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps(page);
  }, [page]);

  const handleWithdraw = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    if (!data) return;
    // Optimistic update: remove from UI immediately
    const prev = data.results;
    setData({ ...data, results: data.results.filter((a) => a.id !== id) });
    try {
      await applicationsAPI.withdrawApplication(id);
      toast.success('Application withdrawn');
      // Optionally, refetch to get updated status
      fetchApps(page);
    } catch {
      setData({ ...data, results: prev });
      toast.error('Failed to withdraw application');
    }
  };

  if (loading && !data) {
    return <ApplicationsListSkeleton />;
  }

  const results = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="My Applications" description="Track the status of your job applications." noindex />
      <h1 className="text-display-sm text-ink-900 mb-8">Applications</h1>

      {results.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start applying to jobs to see your applications here."
          action={
            <a href="/jobs" className="btn-primary">Browse Jobs</a>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {results.map((app) => (
              <div
                key={app.id}
                className="bg-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-shadow duration-200 ease-spring"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/jobs/${app.job_slug}`}
                    className="text-[15px] font-semibold text-ink-900 hover:text-primary-600 transition-colors"
                  >
                    {app.job_title}
                  </Link>
                  <p className="text-[13px] text-ink-500 mt-0.5">{app.company_name}</p>
                  <p className="text-micro text-ink-400 mt-1">
                    Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-micro font-medium ${
                      STATUS_COLORS[app.status] || 'bg-surface-100 text-ink-500'
                    }`}
                  >
                    {app.status}
                  </span>
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="text-micro text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
