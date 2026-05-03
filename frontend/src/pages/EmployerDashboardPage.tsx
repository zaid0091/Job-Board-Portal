import { useEffect, useState } from 'react';
import { analyticsAPI, jobsAPI } from '@/api';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import type { JobListItem, JobStatus } from '@/types';

interface DashboardData {
  overview: {
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    total_views: number;
  };
  applications_by_status: Array<{ status: string; count: number }>;
  daily_applications: Array<{ date: string; count: number }>;
  top_jobs: Array<{ title: string; application_count: number; view_count: number }>;
}

const PIE_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const statusColors: Record<JobStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-700',
};

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    analyticsAPI
      .getEmployerDashboard()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getMyJobs();
      setJobs(response.results || []);
    } catch {
      toast.error('Failed to load your jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }
    setDeletingId(slug);
    try {
      await jobsAPI.deleteJob(slug);
      toast.success('Job deleted successfully');
      setJobs((prev) => prev.filter((job) => job.slug !== slug));
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleViewApplications = (jobId: string) => {
    navigate(`/employer/applications?job=${jobId}`);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-ink-400">Failed to load dashboard data.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total jobs', value: data.overview.total_jobs, icon: BriefcaseIcon, bg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Active jobs', value: data.overview.active_jobs, icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Applications', value: data.overview.total_applications, icon: DocumentTextIcon, bg: 'bg-primary-50 dark:bg-primary-950/40', iconColor: 'text-primary-600 dark:text-primary-400' },
    { label: 'Total views', value: data.overview.total_views, icon: EyeIcon, bg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title="Dashboard" description="Manage your job postings and track applications." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-400 mt-1">Overview of your hiring pipeline</p>
        </div>
        <div className="flex gap-2">
          <Link to="/employer/applications" className="btn-secondary text-sm">
            Applications
          </Link>
          <Link to="/employer/jobs/create" className="btn-primary text-sm">
            Post position
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-4 transition-all duration-200 ease-spring" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-micro text-ink-400">{stat.label}</p>
                <p className="text-xl font-semibold text-ink-800 tabular-nums">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
          <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Daily applications</h2>
          {data.daily_applications.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.daily_applications}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="[&_text]:fill-ink-400" />
                <YAxis allowDecimals={false} className="[&_text]:fill-ink-400" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: 'var(--card-shadow-lg)', fontSize: 13, backgroundColor: 'rgb(var(--surface-50))', color: 'rgb(var(--ink-800))' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-300 text-center py-12">No application data yet</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
          <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Applications by status</h2>
          {data.applications_by_status.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.applications_by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label
                >
                  {data.applications_by_status.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: 'var(--card-shadow-lg)', fontSize: 13, backgroundColor: 'rgb(var(--surface-50))', color: 'rgb(var(--ink-800))' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-300 text-center py-12">No status data yet</p>
          )}
        </div>
      </div>

      {data.top_jobs.length > 0 && (
        <div className="mt-6 bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
          <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Top performing positions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-micro text-ink-400 uppercase tracking-wider border-b border-ink-900/[0.04] dark:border-ink-300/[0.06]">
                  <th className="pb-3 font-medium">Position</th>
                  <th className="pb-3 font-medium text-right">Applications</th>
                  <th className="pb-3 font-medium text-right">Views</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.top_jobs.map((job, i) => (
                  <tr key={i} className="hover:bg-surface-50/50 transition-colors border-b border-ink-900/[0.03] dark:border-ink-300/[0.04]">
                    <td className="py-3 font-medium text-ink-800">{job.title}</td>
                    <td className="py-3 text-right text-ink-500 tabular-nums">{job.application_count}</td>
                    <td className="py-3 text-right text-ink-500 tabular-nums">{job.view_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Management Section */}
      <div className="mt-6 bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-[15px] font-semibold text-ink-800">Manage your jobs</h2>
          <Link to="/employer/jobs/create" className="btn-primary text-sm">
            + Post new job
          </Link>
        </div>

        {jobsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-ink-400">No jobs posted yet.</p>
            <Link to="/employer/jobs/create" className="btn-primary text-sm mt-4 inline-block">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-micro text-ink-400 uppercase tracking-wider border-b border-ink-900/[0.04] dark:border-ink-300/[0.06]">
                  <th className="pb-3 font-medium">Job Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-center">Views</th>
                  <th className="pb-3 font-medium text-center">Applications</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-50/50 transition-colors border-b border-ink-900/[0.03] dark:border-ink-300/[0.04]">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink-800">{job.title}</span>
                        <span className="text-micro text-ink-400">{job.location} • {job.job_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-center text-ink-500 tabular-nums">{job.views_count}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleViewApplications(job.id)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <UsersIcon className="h-4 w-4" />
                        {job.applications_count}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/jobs/${job.slug}/edit`}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-zinc-800 text-ink-500 hover:text-primary-600 transition-colors"
                          title="Edit job"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleViewApplications(job.id)}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-zinc-800 text-ink-500 hover:text-primary-600 transition-colors"
                          title="View applications"
                        >
                          <UsersIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.slug)}
                          disabled={deletingId === job.slug}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-ink-500 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete job"
                        >
                          {deletingId === job.slug ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
