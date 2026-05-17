import { useEffect, useState } from 'react';
import { analyticsAPI, jobsAPI } from '@/api';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  EyeIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  PlusIcon,
  ChartBarIcon,
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
import { motion } from 'framer-motion';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Parallax from '@/components/ui/Parallax';

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

const PIE_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#71717A'];

const statusColors: Record<JobStatus, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  CLOSED: 'bg-red-500/10 text-red-500 border-red-500/20',
  EXPIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
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
    }
  };

  const handleViewApplications = (jobId: string) => {
    navigate(`/employer/applications?job=${jobId}`);
  };

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <PremiumCard className="max-w-md w-full p-8 border-red-500/10">
          <p className="text-sm text-ink-400">Failed to load hiring analytics. Please try again.</p>
        </PremiumCard>
      </div>
    );
  }

  const stats = [
    { label: 'Total Postings', value: data.overview.total_jobs, icon: BriefcaseIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Positions', value: data.overview.active_jobs, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Applications', value: data.overview.total_applications, icon: UsersIcon, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { label: 'Engagement Views', value: data.overview.total_views, icon: EyeIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 relative overflow-hidden">
      <SEO title="Employer Dashboard" description="Manage your job postings and track applications." noindex />
      
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
      <Parallax offset={50} className="absolute top-20 left-[-10%] w-96 h-96 bg-primary-500/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-primary-500/20">
                Talent Pipeline
              </span>
            </div>
            <h1 className="text-display-lg font-black text-ink-900 dark:text-white tracking-tight leading-[0.95]">
              Manage your<br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent italic">
                hiring legacy.
              </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="flex gap-4">
              <Link to="/messages" className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-ink-700 dark:text-white font-bold uppercase tracking-widest text-[11px] rounded-xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700">
                Inbox
              </Link>
              <Link to="/employer/jobs/create" className="group flex items-center gap-3 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl transition-all shadow-xl shadow-primary-500/20">
                <PlusIcon className="h-4 w-4" />
                Post Position
              </Link>
            </div>
          </ScrollReveal>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={0.1 + i * 0.1}>
              <motion.div whileHover={{ y: -5, scale: 1.01 }} className="h-full">
                <PremiumCard className="p-6 border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full">
                  <div className="flex items-start mb-4">
                    <div className={`${stat.bg} p-3 rounded-2xl`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-ink-900 dark:text-white mt-1 tabular-nums tracking-tighter">{stat.value}</p>
                </PremiumCard>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <ScrollReveal delay={0.4}>
              <PremiumCard className="p-8 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
                    <h2 className="text-2xl font-black text-ink-900 dark:text-white tracking-tight">
                      Application Velocity
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-ink-400 uppercase tracking-widest">
                    <ChartBarIcon className="h-4 w-4" />
                    Last 30 Days
                  </div>
                </div>
                {data.daily_applications.length > 0 ? (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.daily_applications}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600 }} 
                          className="fill-ink-400 uppercase tracking-wider" 
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false} 
                          tick={{ fontSize: 10, fontWeight: 600 }}
                          className="fill-ink-400" 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(var(--primary-500), 0.05)' }}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                            fontSize: 12, 
                            fontWeight: 'bold',
                            backgroundColor: 'rgb(var(--surface-50))',
                            color: 'rgb(var(--ink-800))'
                          }} 
                        />
                        <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <p className="text-ink-300 font-medium italic">Velocity data pending initial applications.</p>
                  </div>
                )}
              </PremiumCard>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-4">
            <ScrollReveal delay={0.5}>
              <PremiumCard className="p-8 border-white/5 h-full">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
                  <h2 className="text-2xl font-black text-ink-900 dark:text-white tracking-tight">
                    Conversion Funnel
                  </h2>
                </div>
                {data.applications_by_status.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.applications_by_status}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="count"
                          nameKey="status"
                          stroke="none"
                        >
                          {data.applications_by_status.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                            fontSize: 12, 
                            fontWeight: 'bold',
                            backgroundColor: 'rgb(var(--surface-50))',
                            color: 'rgb(var(--ink-800))'
                          }} 
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <p className="text-ink-300 font-medium italic">No status data yet.</p>
                  </div>
                )}
              </PremiumCard>
            </ScrollReveal>
          </div>
        </div>

        {/* Job Management */}
        <ScrollReveal delay={0.6}>
          <PremiumCard className="p-8 border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
                <div>
                  <h2 className="text-3xl font-black text-ink-900 dark:text-white tracking-tight">Active Portfolio</h2>
                  <p className="text-sm text-ink-400 mt-1">Manage and optimize your active job listings.</p>
                </div>
              </div>
              <Link to="/employer/jobs/create" className="px-6 py-3 bg-primary-600 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-primary-500 transition-all text-center">
                Create Posting
              </Link>
            </div>

            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-micro font-bold text-ink-300 uppercase tracking-[0.2em]">Synchronizing Listings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-ink-400 font-medium">No positions currently listed in your portfolio.</p>
                <Link to="/employer/jobs/create" className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-ink-900 dark:text-white uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.2em]">
                      <th className="pb-4 pl-4 font-bold">Position Architecture</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 text-center font-bold">Metrics</th>
                      <th className="pb-4 text-right pr-4 font-bold">Orchestration</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {jobs.map((job) => (
                      <motion.tr 
                        key={job.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 transition-all"
                      >
                        <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-zinc-100/50 dark:border-zinc-800/50 group-hover:border-primary-500/20">
                          <div className="flex flex-col">
                            <span className="font-bold text-ink-900 dark:text-white text-base tracking-tight">{job.title}</span>
                            <span className="text-[12px] text-ink-400 font-medium mt-0.5">{job.location} • {job.job_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-5 border-y border-zinc-100/50 dark:border-zinc-800/50 group-hover:border-primary-500/20">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-5 border-y border-zinc-100/50 dark:border-zinc-800/50 group-hover:border-primary-500/20">
                          <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Views</p>
                              <p className="font-extrabold text-ink-900 dark:text-white tabular-nums">{job.views_count}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Apps</p>
                              <button 
                                onClick={() => handleViewApplications(job.id)}
                                className="font-extrabold text-primary-500 hover:text-primary-600 transition-colors tabular-nums"
                              >
                                {job.applications_count}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-zinc-100/50 dark:border-zinc-800/50 group-hover:border-primary-500/20">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/jobs/${job.slug}/edit`}
                              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-ink-500 hover:text-primary-500 transition-all shadow-sm"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleViewApplications(job.id)}
                              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-ink-500 hover:text-primary-500 transition-all shadow-sm"
                            >
                              <UsersIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(job.slug)}
                              disabled={deletingId === job.slug}
                              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-ink-500 hover:text-red-500 transition-all shadow-sm"
                            >
                              {deletingId === job.slug ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PremiumCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
