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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="Applications" description="Review and manage candidate applications." noindex />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-sm text-ink-900">Applications</h1>
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary-600 hover:text-primary-500 transition-colors">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Dashboard
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
