import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import SEO from '@/components/SEO';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Parallax from '@/components/ui/Parallax';
import PremiumCard from '@/components/ui/PremiumCard';
import Magnetic from '@/components/ui/Magnetic';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import ScrollScale from '@/components/ui/ScrollScale';
import LineReveal from '@/components/ui/LineReveal';

import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function HomePage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats } = usePlatformStats();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);

  return (
    <div>
      <SEO
        title="Find Your Dream Job or Hire Top Talent"
        description="A curated platform connecting top-tier professionals with companies that value talent. No noise, just the right fit."
        canonical="/"
      />

      {/* ——— Hero ——— */}
      <section ref={heroRef} className="relative bg-gradient-to-b from-primary-950 via-zinc-950 to-zinc-950 dark:from-primary-950/80 dark:via-zinc-900 dark:to-zinc-900 overflow-hidden -mt-14 [mask-image:linear-gradient(to_bottom,black_calc(100%-80px),transparent_100%)]">
        {/* Grid overlay */}
        <motion.div style={{ opacity: useTransform(heroScroll, [0, 1], [0.2, 0]) }} className="absolute inset-0 bg-grid-white" />
        {/* Gradient orbs */}
        <Parallax offset={100} className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-600/20 dark:bg-primary-500/25 rounded-full blur-[120px]" />
        <Parallax offset={-80} className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary-400/10 dark:bg-primary-400/15 rounded-full blur-[100px]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative max-w-5xl mx-auto px-4 sm:px-6 py-28 sm:py-36 lg:py-44">
          <ScrollReveal direction="up" duration={1} distance={20} className="[perspective:1000px]">
            <div className="text-center [transform-style:preserve-3d]">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-shimmer" />
                <span className="text-[13px] font-medium text-white/70">
                  Now with AI-powered matching
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-sm sm:text-display lg:text-display-lg text-white max-w-3xl mx-auto"
              >
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
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 text-body-lg text-white/50 max-w-xl mx-auto"
              >
                A curated platform connecting top-tier professionals with companies
                that value talent. No noise, just the right fit.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Magnetic strength={50}>
                  <Link
                    to="/jobs"
                    className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white rounded-xl overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10 animate-pulse" />
                    <span className="relative">Explore positions</span>
                    <ArrowRightIcon className="relative h-4 w-4" style={{ animation: 'nudge-right 1.5s ease-in-out infinite' }} />
                  </Link>
                </Magnetic>
                
                {!isAuthenticated && (
                  <Magnetic strength={30}>
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
                  </Magnetic>
                )}
                {isAuthenticated && user?.role === 'EMPLOYER' && (
                  <Magnetic strength={20}>
                    <Link
                      to="/employer/jobs/create"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-xl hover:bg-white/[0.04] transition-all duration-150"
                    >
                      Post a position
                    </Link>
                  </Magnetic>
                )}
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Metrics strip with animated counters */}
          <ScrollReveal direction="up" delay={0.2} duration={1}>
            <div className="mt-20 flex items-center justify-center px-4 sm:px-0">
              <div className="inline-flex items-center divide-x divide-white/[0.06] bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm px-1 overflow-x-auto no-scrollbar max-w-full">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="px-4 sm:px-8 py-4 text-center min-w-fit">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                      className="text-lg sm:text-xl font-semibold text-white tabular-nums"
                    >
                      <AnimatedCounter value={Number(stat.value.replace(/\D/g, '')) || 0} suffix={stat.value.includes('K') ? 'K+' : '+'} className="tabular-nums" />
                    </motion.div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-white/30 uppercase tracking-wider mt-0.5 whitespace-nowrap">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, rgb(var(--bg-page)), transparent)' }} />
      </section>

      {/* ——— Logo cloud (trust) ——— */}
      <section className="py-12 border-b border-ink-900/[0.04] dark:border-ink-300/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" distance={10}>
            <div className="flex justify-center mb-8">
              <div className="relative inline-flex items-center px-6 py-2 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50">
                <span className="absolute -top-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -top-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-700 dark:text-primary-200">Trusted by teams at</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap grayscale">
              {[
                { name: 'Google', className: "font-['Product_Sans',sans-serif] tracking-tighter" },
                { name: 'Microsoft', className: "font-['Segoe_UI',sans-serif] font-semibold tracking-tight" },
                { name: 'amazon', className: "font-['Amazon_Ember',sans-serif] font-bold tracking-tighter translate-y-0.5" },
                { name: 'Meta', className: "font-['Helvetica_Neue',sans-serif] font-medium tracking-tight" },
                { name: 'Apple', className: "font-['San_Francisco',sans-serif] font-semibold tracking-tight" }
              ].map((company, i) => (
                <motion.span
                  key={company.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`text-xl sm:text-2xl text-ink-300 select-none ${company.className}`}
                >
                  {company.name}
                </motion.span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ——— Line divider ——— */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <LineReveal className="bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" delay={0.2} duration={1.2} />
      </div>

      {/* ——— Features ——— */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" duration={0.8}>
            <div className="text-center max-w-xl mx-auto">
              <div className="relative inline-flex items-center px-6 py-2 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 mb-6">
                <span className="absolute -top-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -top-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-700 dark:text-primary-200">Platform</p>
              </div>
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
              { icon: BoltIcon, title: 'Instant matching', desc: 'Our algorithm surfaces the most relevant roles based on your skills, experience, and preferences.' },
              { icon: EyeIcon, title: 'Full transparency', desc: 'Track every application in real-time. Know exactly where you stand — no black holes.' },
              { icon: ShieldCheckIcon, title: 'Verified employers', desc: 'Every company on our platform is vetted. You apply with confidence, knowing the opportunity is real.' },
              { icon: ChartBarSquareIcon, title: 'Smart analytics', desc: 'Employers get dashboard insights on posting performance, applicant quality, and conversion rates.' },
              { icon: ArrowUpRightIcon, title: 'One-click apply', desc: 'Upload your resume once, then apply to any position with a single click. Fast, simple, effective.' },
              { icon: ShieldCheckIcon, title: 'Privacy first', desc: 'Your data stays yours. We never share candidate information without explicit consent.' },
            ].map((f, i) => (
              <ScrollScale key={f.title} fromScale={0.9} fromOpacity={0} fromRotate={3} threshold={0.15}>
                <div className="h-full [perspective:1000px]" style={{ transitionDelay: `${i * 80}ms` }}>
                  <PremiumCard className="h-full transform transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(124,58,237,0.15)] [transform-style:preserve-3d] hover:[transform:rotateX(5deg)_rotateY(5deg)]">
                    <div className="p-8">
                      <motion.div
                        className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-6"
                        whileHover={{ scale: 1.1, rotate: 6 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                      >
                        <f.icon className="h-6 w-6 text-primary-600" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-ink-800 mb-3">{f.title}</h3>
                      <p className="text-sm text-ink-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </PremiumCard>
                </div>
              </ScrollScale>
            ))}
          </div>
        </div>
      </section>

      {/* ——— How it works (Sticky Scroll) ——— */}
      <section className="border-y border-ink-900/[0.04] dark:border-ink-300/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-24 sm:py-32 text-center max-w-xl mx-auto">
            <ScrollReveal direction="up" duration={0.8}>
              <div className="relative inline-flex items-center px-6 py-2 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 mb-6">
                <span className="absolute -top-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -top-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-700 dark:text-primary-200">Process</p>
              </div>
              <h2 className="mt-3 text-display-sm text-ink-900">
                Three steps to your next role
              </h2>
              <p className="mt-4 text-body-lg text-ink-400 leading-relaxed">
                From profile to offer — a streamlined journey designed to get you hired faster.
              </p>
            </ScrollReveal>
          </div>

          {/* Sticky scroll steps */}
          <div className="pb-24 sm:pb-32">
            {[
              { step: '01', title: 'Create your profile', desc: 'Set up your professional profile with skills, experience, and career preferences.', gradient: 'from-zinc-800 to-zinc-700 dark:from-zinc-700 dark:to-zinc-600', accent: 'from-zinc-400 to-zinc-500', glow: 'bg-zinc-500/30' },
              { step: '02', title: 'Discover opportunities', desc: 'Browse curated listings or let our platform surface the best matches for you.', gradient: 'from-blue-700 to-indigo-600 dark:from-blue-600 dark:to-indigo-500', accent: 'from-blue-300 to-indigo-300', glow: 'bg-blue-500/30' },
              { step: '03', title: 'Apply and track', desc: 'Submit applications instantly and track every stage from submission to offer.', gradient: 'from-amber-600 to-orange-500 dark:from-amber-500 dark:to-orange-400', accent: 'from-amber-300 to-orange-300', glow: 'bg-amber-500/30' },
            ].map((item, i) => (
              <ScrollScale key={item.step} fromScale={0.85} fromOpacity={0} fromRotate={-2} duration={0.8}>
                <motion.div
                  className="group relative max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl border border-ink-900/[0.06] bg-card overflow-hidden mb-6"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Gradient orb */}
                  <motion.div
                    className={`absolute -top-20 -right-20 w-40 h-40 ${item.glow} opacity-10 blur-3xl`}
                    whileHover={{ scale: 1.5, opacity: 0.2 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className="relative flex items-start gap-6">
                  {/* Premium step indicator */}
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
                  >
                    {/* Outer glow */}
                    <motion.div
                      className={`absolute inset-0 rounded-[20px] ${item.glow} blur-xl`}
                      whileHover={{ scale: 1.3, opacity: 0.5 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Main box */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center overflow-hidden shadow-lg`}>
                      {/* Glass highlight layer */}
                      <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-b from-white/25 to-transparent" />
                      
                      {/* Bottom depth shadow */}
                      <div className="absolute inset-x-[1px] bottom-[1px] h-1/2 rounded-b-[15px] bg-gradient-to-b from-transparent to-black/20" />
                      
                      {/* Inner ring */}
                      <div className="absolute inset-[2px] rounded-[14px] border border-white/10" />
                      
                      {/* Horizontal shine sweep */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-[20deg]"
                        initial={{ x: '-120%' }}
                        whileInView={{ x: '120%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.4 + i * 0.2, ease: 'easeInOut' }}
                      />
                      
                      {/* Step number with gradient text */}
                      <span className={`relative bg-gradient-to-b ${item.accent} bg-clip-text text-[22px] font-black tracking-tight`} style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.1)' }}>
                        {item.step}
                      </span>
                    </div>
                  </motion.div>

                    <div className="pt-1">
                      <h3 className="text-xl font-bold text-ink-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Bottom line reveal */}
                  <LineReveal className={`mt-6 bg-gradient-to-r ${item.gradient}`} delay={0.3} duration={0.8} fromLeft={false} />
                </motion.div>
              </ScrollScale>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      {!isAuthenticated && (
        <section className="py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollScale fromScale={0.9} fromOpacity={0} fromRotate={2} threshold={0.2}>
              <div className="relative rounded-3xl bg-gradient-to-br from-primary-950 via-zinc-950 to-zinc-900 overflow-hidden px-8 sm:px-16 py-16 sm:py-20 text-center">
                <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-30" />
                <Parallax offset={30} className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-600/15 rounded-full blur-[80px]" />
                <Parallax offset={-20} className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-primary-400/10 rounded-full blur-[60px]" />

                <div className="relative">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-display-sm sm:text-display text-white"
                  >
                    Ready to get started?
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 text-body-lg text-white/40 max-w-md mx-auto"
                  >
                    Join thousands of professionals who found their next opportunity through Jobly.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
                  >
                    <Magnetic strength={40}>
                      <Link
                        to="/register"
                        className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-900 bg-white rounded-xl overflow-hidden hover:shadow-[0_0_32px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-primary-100/50 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        <span className="relative">Create free account</span>
                        <ArrowRightIcon className="relative h-3.5 w-3.5" />
                      </Link>
                    </Magnetic>
                    <Magnetic strength={25}>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/70 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-xl transition-all duration-150"
                      >
                        Browse positions
                      </Link>
                    </Magnetic>
                  </motion.div>
                </div>
              </div>
            </ScrollScale>
          </div>
        </section>
      )}
    </div>
  );
}
