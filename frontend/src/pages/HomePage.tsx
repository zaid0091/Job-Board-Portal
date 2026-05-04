import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import SEO from '@/components/SEO';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats } = usePlatformStats();

  return (
    <div>
      <SEO description="Find your dream job or hire top talent. Browse thousands of job listings across industries." />
      {/* â”€â”€â”€ Hero â”€â”€â”€ */}
      <section className="relative bg-gradient-to-b from-primary-950 via-zinc-950 to-zinc-950 dark:from-primary-950/80 dark:via-zinc-900 dark:to-zinc-900 overflow-hidden -mt-14">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-40" />
        {/* Gradient orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-600/20 dark:bg-primary-500/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary-400/10 dark:bg-primary-400/15 rounded-full blur-[100px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-28 sm:py-36 lg:py-44">
          <ScrollReveal direction="up" duration={1} distance={20}>
            <div className="text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-shimmer" />
                <span className="text-[13px] font-medium text-white/70">
                  Now with AI-powered matching
                </span>
              </div>

              <h1 className="text-display-sm sm:text-display lg:text-display-lg text-white max-w-3xl mx-auto">
                Where exceptional talent{' '}
                <span className="relative inline-block">
                  meets opportunity
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 9C50 3 100 2 150 5C200 8 250 4 298 7" stroke="url(#hero-underline)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="hero-underline" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#7c3aed" />
                        <stop offset="1" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="mt-7 text-body-lg text-white/50 max-w-xl mx-auto">
                A curated platform connecting top-tier professionals with companies
                that value talent. No noise, just the right fit.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/jobs"
                  className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white rounded-xl overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10 animate-pulse" />
                  <span className="relative">Explore positions</span>
                  <ArrowRightIcon className="relative h-4 w-4" style={{ animation: 'nudge-right 1.5s ease-in-out infinite' }} />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] bg-white/[0.08] border border-white/[0.15] hover:border-white/[0.3] backdrop-blur-sm text-white hover:shadow-[0_0_24px_rgba(255,255,255,0.1)]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Create account
                    </span>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'EMPLOYER' && (
                  <Link
                    to="/employer/jobs/create"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-xl hover:bg-white/[0.04] transition-all duration-150"
                  >
                    Post a position
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Metrics strip */}
          <ScrollReveal direction="up" delay={0.2} duration={1}>
            <div className="mt-20 flex items-center justify-center">
              <div className="inline-flex items-center divide-x divide-white/[0.06] bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm px-1">
                {stats.map((stat) => (
                  <div key={stat.label} className="px-6 sm:px-8 py-4 text-center">
                    <div className="text-lg sm:text-xl font-semibold text-white tabular-nums">{stat.value}</div>
                    <div className="text-[11px] font-medium text-white/30 uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, rgb(var(--bg-page)), transparent)' }} />
      </section>

      {/* â”€â”€â”€ Logo cloud (trust) â”€â”€â”€ */}
      <section className="py-12 border-b border-ink-900/[0.04] dark:border-ink-300/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" distance={10}>
            <p className="text-center text-micro text-ink-300 uppercase tracking-widest mb-6">
              Trusted by teams at
            </p>
            <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap grayscale">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((name) => (
                <span key={name} className="text-lg sm:text-xl font-bold text-ink-300 select-none">{name}</span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* â”€â”€â”€ Features â”€â”€â”€ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" duration={0.8}>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-micro text-primary-600 uppercase tracking-widest">Platform</p>
              <h2 className="mt-3 text-display-sm text-ink-900">
                Built for modern hiring
              </h2>
              <p className="mt-4 text-body-lg text-ink-400 leading-relaxed">
                Every detail engineered to make the hiring process faster, fairer, and more transparent.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BoltIcon,
                title: 'Instant matching',
                desc: 'Our algorithm surfaces the most relevant roles based on your skills, experience, and preferences.',
              },
              {
                icon: EyeIcon,
                title: 'Full transparency',
                desc: 'Track every application in real-time. Know exactly where you stand — no black holes.',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Verified employers',
                desc: 'Every company on our platform is vetted. You apply with confidence, knowing the opportunity is real.',
              },
              {
                icon: ChartBarSquareIcon,
                title: 'Smart analytics',
                desc: 'Employers get dashboard insights on posting performance, applicant quality, and conversion rates.',
              },
              {
                icon: ArrowUpRightIcon,
                title: 'One-click apply',
                desc: 'Upload your resume once, then apply to any position with a single click. Fast, simple, effective.',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Privacy first',
                desc: 'Your data stays yours. We never share candidate information without explicit consent.',
              },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.1} distance={20}>
                <div
                  className="group h-full relative p-6 rounded-2xl border border-ink-900/[0.06] hover:border-ink-900/[0.12] transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-950/60 transition-colors">
                    <f.icon className="h-[18px] w-[18px] text-primary-600" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink-800">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-400 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ How it works â”€â”€â”€ */}
      <section className="py-24 sm:py-32 border-y border-ink-900/[0.04] dark:border-ink-300/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" duration={0.8}>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-micro text-primary-600 uppercase tracking-widest">Process</p>
              <h2 className="mt-3 text-display-sm text-ink-900">
                Three steps to your next role
              </h2>
              <p className="mt-4 text-body-lg text-ink-400 leading-relaxed">
                From profile to offer — a streamlined journey designed to get you hired faster.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create your profile',
                desc: 'Set up your professional profile with skills, experience, and career preferences.',
              },
              {
                step: '02',
                title: 'Discover opportunities',
                desc: 'Browse curated listings or let our platform surface the best matches for you.',
              },
              {
                step: '03',
                title: 'Apply and track',
                desc: 'Submit applications instantly and track every stage from submission to offer.',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.15} distance={20}>
                <div className="group h-full relative p-6 rounded-2xl border border-ink-900/[0.06] hover:border-ink-900/[0.12] bg-card hover:bg-surface-50/50 dark:hover:bg-surface-100/50 transition-all duration-200">
                  <span className="text-micro text-primary-500 group-hover:text-primary-600 transition-colors">{item.step}</span>
                  <h3 className="mt-3 text-[15px] font-semibold text-ink-800">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ CTA â”€â”€â”€ */}
      {!isAuthenticated && (
        <section className="py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollReveal direction="up" distance={30} duration={1}>
              <div className="relative rounded-3xl bg-gradient-to-br from-primary-950 via-zinc-950 to-zinc-900 overflow-hidden px-8 sm:px-16 py-16 sm:py-20 text-center">
                {/* Grid behind */}
                <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-30" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-600/15 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-primary-400/10 rounded-full blur-[60px]" />

                <div className="relative">
                  <h2 className="text-display-sm sm:text-display text-white">
                    Ready to get started?
                  </h2>
                  <p className="mt-4 text-body-lg text-white/40 max-w-md mx-auto">
                    Join thousands of professionals who found their next opportunity through Jobly.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-900 bg-white rounded-xl hover:bg-zinc-100 transition-colors"
                    >
                      Create free account
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/70 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-xl transition-all duration-150"
                    >
                      Browse positions
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  );
}
