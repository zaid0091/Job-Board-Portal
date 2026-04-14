import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/api';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
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
import { Link } from 'react-router-dom';

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

export default function EmployerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI
      .getEmployerDashboard()
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
    </div>
  );
}
