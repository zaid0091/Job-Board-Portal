import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ApplicationItem from '@/components/applications/ApplicationItem';
import type { ApplicationListItem, ApplicationStatus, PaginatedResponse } from '@/types';

export default function EmployerApplicationsPage() {
  const [data, setData] = useState<PaginatedResponse<ApplicationListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApps = useCallback(() => {
    setLoading(true);
    applicationsAPI
      .getApplications()
      .then((res) => setData(res))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleStatusUpdate = useCallback(async (id: string, newStatus: ApplicationStatus) => {
    const label = newStatus === 'HIRED' ? 'hire this candidate' : `mark as ${newStatus.toLowerCase()}`;
    if (!confirm(`Are you sure you want to ${label}?`)) return;

    setUpdatingId(id);
    try {
      await applicationsAPI.updateStatus(id, newStatus);
      toast.success(`Application ${newStatus === 'HIRED' ? 'hired' : 'updated'} successfully!`);
      fetchApps();
    } catch {
      toast.error('Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  }, [fetchApps]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const applications = data?.results ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      <SEO title="Applications" description="Review and manage candidate applications." noindex />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
          <h1 className="text-display-md font-black text-ink-900 dark:text-white tracking-tight">
            Candidate <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent italic">Applications</span>
          </h1>
        </div>
        <Link to="/employer/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-ink-700 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center" style={{ boxShadow: 'var(--card-shadow)' }}>
          <p className="text-ink-500 text-[15px]">No applications yet</p>
          <p className="text-ink-400 text-[13px] mt-1">Applications to your job postings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <ApplicationItem
              key={app.id}
              app={app}
              index={i}
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
