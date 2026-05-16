import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '@/api';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  BookmarkIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion} from 'framer-motion';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Parallax from '@/components/ui/Parallax';

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
    job__employer__id: string;
    status: string;
    created_at: string;
  }>;
  hired_jobs: Array<{
    id: string;
    job__title: string;
    job__slug: string;
    job__employer__company_name: string;
    job__employer__id: string;
    updated_at: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  REVIEWING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  SHORTLISTED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  INTERVIEW: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  OFFERED: 'bg-green-500/10 text-green-500 border-green-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  WITHDRAWN: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

const PIE_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#06B6D4', '#EC4899', '#71717A'];

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

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Total Applications', value: data.overview.total_applications, icon: DocumentTextIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/seeker/applications' },
      { label: 'Successful Hires', value: data.overview.hired_count, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Saved Positions', value: data.overview.saved_jobs, icon: BookmarkIcon, color: 'text-primary-500', bg: 'bg-primary-500/10', link: '/seeker/saved-jobs' },
      { label: 'Response Rate', value: `${data.overview.response_rate}%`, icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.applications_by_status).map(([status, count]) => ({ name: status, value: count }));
  }, [data]);

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <PremiumCard className="max-w-md w-full p-8 text-center border-red-500/10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Sync Error</h2>
          <p className="text-ink-400 mb-6">We encountered a problem loading your career insights. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">Retry Connection</button>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 relative overflow-hidden">
      <SEO title="Career Dashboard" description="Track your job search progress and applications." noindex />
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
      <Parallax offset={50} className="absolute top-20 right-[-10%] w-96 h-96 bg-primary-500/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-primary-500/20">
                Career Insights
              </span>
            </div>
            <h1 className="text-display-lg font-black text-ink-900 dark:text-white tracking-tight leading-[0.95]">
              Welcome back,<br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent italic">
                your next move awaits.
              </span>
            </h1>
            <p className="mt-4 text-lg text-ink-400 max-w-xl">
              Track your applications, manage your saved positions, and analyze your hiring performance across the Jobly network.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <Link to="/jobs" className="group flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold uppercase tracking-widest text-[12px] rounded-full transition-all shadow-xl shadow-primary-500/20">
              Explore Openings
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={0.1 + i * 0.1}>
              <motion.div whileHover={{ y: -5, scale: 1.01 }} className="h-full">
                {stat.link ? (
                  <Link to={stat.link}>
                    <PremiumCard className="p-6 border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full group hover:border-primary-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`${stat.bg} p-3 rounded-2xl`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-ink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-ink-900 dark:text-white mt-1 tabular-nums tracking-tighter">{stat.value}</p>
                    </PremiumCard>
                  </Link>
                ) : (
                  <PremiumCard className="p-6 border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full">
                    <div className="flex items-start mb-4">
                      <div className={`${stat.bg} p-3 rounded-2xl`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white mt-1 tabular-nums tracking-tighter">{stat.value}</p>
                  </PremiumCard>
                )}
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <ScrollReveal delay={0.4}>
              <PremiumCard className="p-8 border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
                    <h2 className="text-2xl font-black text-ink-900 dark:text-white tracking-tight flex items-center gap-3">
                      Recent Activity
                      <span className="px-2.5 py-1 bg-primary-500/5 text-[9px] font-black text-primary-500 rounded-lg border border-primary-500/10 uppercase tracking-[0.2em]">
                        Live
                      </span>
                    </h2>
                  </div>
                  <Link to="/seeker/applications" className="text-[11px] font-black text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-[0.2em] bg-primary-500/5 px-4 py-2 rounded-xl border border-primary-500/10">
                    View All Activity
                  </Link>
                </div>

                {data.recent_applications.length > 0 ? (
                  <div className="space-y-4">
                    {data.recent_applications.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Link to={`/jobs/${app.job__slug}`} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-transparent hover:border-primary-500/20 hover:bg-white dark:hover:bg-zinc-800 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xl font-bold text-primary-500 border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                              {app.job__employer__company_name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-ink-900 dark:text-white truncate tracking-tight">{app.job__title}</p>
                              <p className="text-[13px] text-ink-400 font-medium">{app.job__employer__company_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.1em] border ${STATUS_COLORS[app.status] || 'bg-zinc-100 text-ink-400 border-zinc-200'}`}>
                              {app.status}
                            </span>
                            <ArrowRightIcon className="h-4 w-4 text-ink-300 group-hover:text-primary-500 transition-colors" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-ink-300 font-medium italic">Your journey hasn't started yet. Browse jobs to begin.</p>
                  </div>
                )}
              </PremiumCard>
            </ScrollReveal>

            {data.hired_jobs.length > 0 && (
              <ScrollReveal delay={0.6}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    <h2 className="text-2xl font-black text-ink-900 dark:text-white tracking-tight">
                      Placement History
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.hired_jobs.map((hj) => (
                      <PremiumCard key={hj.id} className="p-5 border-emerald-500/10 bg-emerald-500/[0.02]">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-emerald-900 dark:text-emerald-300 truncate tracking-tight">{hj.job__title}</p>
                            <p className="text-[12px] text-emerald-700/70 dark:text-emerald-400/70 font-medium">{hj.job__employer__company_name}</p>
                            <Link to={`/employers/${hj.job__employer__id}`} className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700">
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </PremiumCard>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal delay={0.5}>
              <PremiumCard className="p-8 border-white/5">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
                  <h2 className="text-2xl font-black text-ink-900 dark:text-white tracking-tight">
                    Status Distribution
                  </h2>
                </div>
                {pieData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_, index) => (
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
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-ink-300 font-medium italic text-sm">Waiting for data...</p>
                  </div>
                )}
              </PremiumCard>
            </ScrollReveal>

            <ScrollReveal delay={0.7}>
              <PremiumCard className="p-8 border-white/5 bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                  <SparklesIcon className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Premium Member</h3>
                <p className="text-primary-100 text-[13px] mb-6 relative z-10 leading-relaxed">
                  Unlock exclusive data insights, direct employer messaging, and priority application status.
                </p>
                <button className="w-full py-3 bg-white text-primary-700 text-[12px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-50 transition-colors relative z-10">
                  Upgrade Now
                </button>
              </PremiumCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
