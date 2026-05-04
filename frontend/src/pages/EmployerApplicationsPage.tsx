import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ChevronDownIcon, DocumentArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApplicationListItem, ApplicationDetail, ApplicationStatus, PaginatedResponse } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  REVIEWING: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  SHORTLISTED: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  INTERVIEW: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
  OFFERED: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  HIRED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  WITHDRAWN: 'bg-surface-100 text-ink-500',
};

const STATUS_TRANSITIONS: Record<string, ApplicationStatus[]> = {
  PENDING: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFERED', 'REJECTED'],
  OFFERED: ['HIRED', 'REJECTED'],
};

export default function EmployerApplicationsPage() {
  const [data, setData] = useState<PaginatedResponse<ApplicationListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ApplicationDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const fetchApps = () => {
    setLoading(true);
    applicationsAPI
      .getApplications()
      .then((res) => setData(res))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!details[id]) {
      setLoadingDetail(id);
      try {
        const detail = await applicationsAPI.getApplication(id);
        setDetails((prev) => ({ ...prev, [id]: detail }));
      } catch {
        toast.error('Failed to load application details');
      } finally {
        setLoadingDetail(null);
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: ApplicationStatus) => {
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
  };

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
      <SEO title="Applications" description="Review and manage candidate applications." />
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
          {applications.map((app, i) => {
            const transitions = STATUS_TRANSITIONS[app.status] ?? [];
            const isTerminal = ['HIRED', 'REJECTED', 'WITHDRAWN'].includes(app.status);
            const isExpanded = expandedId === app.id;
            const detail = details[app.id];

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card rounded-xl transition-shadow duration-200"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(app.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Applicant info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-ink-900 truncate">
                        {app.applicant_name || app.applicant_email}
                      </h3>
                      <p className="text-[13px] text-ink-500 mt-0.5">{app.applicant_email}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Link
                          to={`/jobs/${app.job_slug}`}
                          className="text-[13px] text-primary-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {app.job_title}
                        </Link>
                        <span className="text-micro text-ink-400">
                          {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`px-2 py-0.5 rounded-md text-micro font-medium ${STATUS_COLORS[app.status] || 'bg-surface-100 text-ink-500'}`}
                      >
                        {app.status}
                      </span>

                      {!isTerminal && transitions.length > 0 && (
                        <div className="flex gap-2">
                          {transitions.map((nextStatus) => {
                            const isHire = nextStatus === 'HIRED';
                            const isReject = nextStatus === 'REJECTED';
                            let btnClass = 'btn-secondary text-micro px-2.5 py-1';
                            if (isHire) btnClass = 'bg-green-600 hover:bg-green-700 text-white text-micro px-2.5 py-1 rounded-lg font-medium transition-colors';
                            else if (isReject) btnClass = 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 text-micro px-2.5 py-1 rounded-lg font-medium transition-colors';

                            return (
                              <button
                                key={nextStatus}
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusUpdate(app.id, nextStatus)}
                                className={btnClass}
                              >
                                {updatingId === app.id ? '...' : nextStatus.replace('_', ' ')}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <ChevronDownIcon
                        onClick={() => toggleExpand(app.id)}
                        className={`h-4 w-4 text-ink-400 transition-transform duration-200 cursor-pointer hover:text-ink-600 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded detail section */}
                <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-surface-50/60 space-y-4 rounded-b-xl border-t border-ink-900/[0.04] dark:border-ink-300/[0.06]">
                    {loadingDetail === app.id ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : detail ? (
                      <>
                        {detail.cover_letter && (
                          <div>
                            <h4 className="text-micro font-semibold text-ink-600 uppercase tracking-wide mb-1">Cover Letter</h4>
                            <p className="text-[13px] text-ink-600 whitespace-pre-wrap bg-card rounded-lg p-3" style={{ boxShadow: 'var(--card-shadow)' }}>
                              {detail.cover_letter}
                            </p>
                          </div>
                        )}

                        {detail.resume && (
                          <div>
                            <h4 className="text-micro font-semibold text-ink-600 uppercase tracking-wide mb-1">Resume</h4>
                            <a
                              href={detail.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] text-primary-600 hover:text-primary-700 bg-card rounded-lg px-3 py-2 transition-colors"
                              style={{ boxShadow: 'var(--card-shadow)' }}
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" /> Download Resume
                            </a>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {detail.expected_salary && (
                            <div>
                              <h4 className="text-micro font-semibold text-ink-600 uppercase tracking-wide mb-1">Expected Salary</h4>
                              <p className="text-[13px] text-ink-700 tabular-nums">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(detail.expected_salary))}
                              </p>
                            </div>
                          )}
                          {detail.available_from && (
                            <div>
                              <h4 className="text-micro font-semibold text-ink-600 uppercase tracking-wide mb-1">Available From</h4>
                              <p className="text-[13px] text-ink-700">
                                {format(new Date(detail.available_from), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          )}
                        </div>

                        {detail.status_logs && detail.status_logs.length > 0 && (
                          <div>
                            <h4 className="text-micro font-semibold text-ink-600 uppercase tracking-wide mb-1">Status History</h4>
                            <div className="space-y-1">
                              {detail.status_logs.map((log) => (
                                <div key={log.id} className="text-micro text-ink-500 flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 rounded text-micro ${STATUS_COLORS[log.from_status] || ''}`}>{log.from_status}</span>
                                  <span><ArrowRightIcon className="h-3.5 w-3.5" /></span>
                                  <span className={`px-1.5 py-0.5 rounded text-micro ${STATUS_COLORS[log.to_status] || ''}`}>{log.to_status}</span>
                                  <span className="text-ink-400">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!detail.cover_letter && !detail.resume && !detail.expected_salary && !detail.available_from && (
                          <p className="text-[13px] text-ink-400 italic">No additional details provided by the applicant.</p>
                        )}
                      </>
                    ) : null}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
