import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '@/api';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SeekerDashboardData {
  overview: {
    total_applications: number;
    saved_jobs: number;
    response_rate: number;
    hired_count: number;
  };
  applications_by_status: Record<string, number>;
  recent_applications: Array<{
    id: string;
    job__title: string;
    job__slug: string;
    job__employer__company_name: string;
    status: string;
    created_at: string;
  }>;
  hired_jobs: Array<{
    id: string;
    job__title: string;
    job__slug: string;
    job__employer__company_name: string;
    updated_at: string;
  }>;
}

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

const PIE_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#ec4899', '#6b7280'];

export default function SeekerDashboardPage() {
  const [data, setData] = useState<SeekerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI
      .getSeekerDashboard()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    { label: 'Applications', value: data.overview.total_applications, icon: DocumentTextIcon, bg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Hired', value: data.overview.hired_count, icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Saved jobs', value: data.overview.saved_jobs, icon: BookmarkIcon, bg: 'bg-primary-50 dark:bg-primary-950/40', iconColor: 'text-primary-600 dark:text-primary-400' },
    { label: 'Response rate', value: `${data.overview.response_rate}%`, icon: ClockIcon, bg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title="Dashboard" description="Track your job search progress and applications." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-400 mt-1">Track your job search progress</p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">
          Browse positions
        </Link>
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
        {data.hired_jobs.length > 0 && (
          <div className="bg-card rounded-xl p-6 lg:col-span-2" style={{ boxShadow: 'var(--card-shadow-md)' }}>
            <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Hired</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.hired_jobs.map((hj) => (
                <Link
                  key={hj.id}
                  to={`/jobs/${hj.job__slug}`}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 transition-colors ring-1 ring-emerald-500/10 dark:ring-emerald-400/20"
                >
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-emerald-900 dark:text-emerald-300 truncate">{hj.job__title}</p>
                    <p className="text-micro text-emerald-700 dark:text-emerald-400">{hj.job__employer__company_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
          <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Applications by status</h2>
          {Object.keys(data.applications_by_status).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={Object.entries(data.applications_by_status).map(([status, count]) => ({ status, count }))}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label
                >
                  {Object.keys(data.applications_by_status).map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: 'var(--card-shadow-lg)', fontSize: 13, backgroundColor: 'rgb(var(--surface-50))', color: 'rgb(var(--ink-800))' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-300 text-center py-12">No applications yet</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
          <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Recent applications</h2>
          {data.recent_applications.length > 0 ? (
            <div className="space-y-2">
              {data.recent_applications.map((app) => (
                <Link key={app.id} to={`/jobs/${app.job__slug}`} className="flex items-center justify-between p-3 bg-surface-50/60 rounded-lg hover:bg-surface-100/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{app.job__title}</p>
                    <p className="text-micro text-ink-400">{app.job__employer__company_name}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-micro font-medium ml-3 flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-surface-100 text-ink-500'}`}
                  >
                    {app.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-300 text-center py-12">No applications yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
