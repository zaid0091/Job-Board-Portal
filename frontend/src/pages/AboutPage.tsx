import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import SEO from '@/components/SEO';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PremiumCard from '@/components/ui/PremiumCard';
import Magnetic from '@/components/ui/Magnetic';
import LineReveal from '@/components/ui/LineReveal';
import ScrollScale from '@/components/ui/ScrollScale';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';

export default function AboutPage() {
  const { stats } = usePlatformStats();

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <SEO 
        title="About Our Mission" 
        description="Learn about Jobly — our mission to make hiring human again through transparency, verified employers, and AI-powered matching." 
        canonical="/about" 
      />

      {/* --- Hero Section (geometric landing) --- */}
      <HeroGeometric
        className="min-h-0 pt-32 pb-20 sm:pt-48 sm:pb-32 -mt-14 [mask-image:linear-gradient(to_bottom,black_calc(100%-80px),transparent_100%)]"
        contentClassName="px-4 sm:px-6"
      >
        <div className="relative max-w-5xl mx-auto text-center">
          <ScrollReveal direction="up" duration={1} distance={20}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50/80 border border-primary-200/60 backdrop-blur-sm mb-8 dark:bg-white/[0.06] dark:border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary-700 dark:text-white/60">Our Mission</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2} duration={1}>
            <h1 className="text-display-sm sm:text-display lg:text-display-lg text-ink-900 dark:text-white max-w-4xl mx-auto leading-[1.1] font-extrabold tracking-tighter">
              Making hiring <br />
              <span className="text-primary-600 dark:text-primary-400">human again</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} duration={1}>
            <p className="mt-8 text-body-lg text-ink-600 dark:text-white/50 max-w-2xl mx-auto leading-relaxed">
              Jobly was founded with a simple belief: the hiring process should be transparent,
              fair, and efficient for everyone involved. We connect exceptional talent with companies
              that genuinely value what they do.
            </p>
          </ScrollReveal>
        </div>
      </HeroGeometric>

      {/* --- Stats strip --- */}
      <section className="py-12 border-b border-ink-900/[0.04] dark:border-ink-300/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" distance={10}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={stat.label} className="relative group">
                  <div className="text-display-sm font-extrabold text-ink-900 dark:text-white tabular-nums tracking-tighter">
                    <AnimatedCounter value={Number(stat.value.replace(/\D/g, '')) || 0} suffix={stat.value.includes('K') ? 'K+' : '+'} />
                  </div>
                  <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                  {i < stats.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-ink-900/[0.08] dark:bg-white/[0.08]" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- Mission Content --- */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal direction="left" duration={1}>
              <div className="space-y-8">
                <div className="relative inline-flex items-center px-6 py-2 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50">
                  <span className="absolute -top-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                  <span className="absolute -top-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                  <span className="absolute -bottom-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                  <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-primary-500 z-10" />
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 dark:text-primary-200">The Problem</p>
                </div>
                <h2 className="text-display-sm text-ink-900 dark:text-white font-bold tracking-tight leading-tight">
                  No more sending applications <br /> into a <span className="text-ink-400 italic font-serif">black hole.</span>
                </h2>
                <p className="text-body-lg text-ink-400 leading-relaxed">
                  We're on a mission to eliminate the frustration from job searching and hiring. 
                  Every application is tracked, every employer is verified, and every candidate is treated with respect.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid gap-6">
              {[
                { icon: EyeIcon, title: 'Full transparency', desc: 'Track every application in real-time. Know exactly where you stand at every stage.' },
                { icon: ShieldCheckIcon, title: 'Verified employers', desc: 'Every company on our platform is meticulously vetted to ensure high-quality opportunities.' },
                { icon: SparklesIcon, title: 'Human-first AI', desc: 'Our algorithms are built to surface the right fit, not just match keywords.' },
              ].map((item, i) => (
                <ScrollScale key={item.title} delay={i * 0.1}>
                  <PremiumCard className="p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </PremiumCard>
                </ScrollScale>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Divider --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <LineReveal className="bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      </div>

      {/* --- Principles --- */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-display-sm text-ink-900 dark:text-white font-bold tracking-tight mb-16">Our core principles</h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Radical Honesty', desc: 'We believe transparency builds trust. We provide clear feedback and honest timelines.' },
              { step: '02', title: 'Quality over Quantity', desc: 'We don\'t believe in noise. We prioritize meaningful connections over volume.' },
              { step: '03', title: 'User Advocacy', desc: 'Whether you\'re a candidate or an employer, we\'re in your corner.' },
            ].map((p, i) => (
              <ScrollScale key={p.step} delay={i * 0.1}>
                <PremiumCard className="relative p-10 h-full group overflow-hidden">
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="text-[80px] font-black text-ink-900/[0.05] dark:text-white/[0.03] absolute top-2 right-6 select-none group-hover:text-primary-500/[0.1] transition-colors duration-500 pointer-events-none leading-none">
                    {p.step}
                  </div>
                  
                  <div className="relative z-10 pt-4">
                    <h3 className="text-xl font-bold text-ink-900 dark:text-white mb-4">{p.title}</h3>
                    <p className="text-body-lg text-ink-400 leading-relaxed">{p.desc}</p>
                  </div>
                </PremiumCard>
              </ScrollScale>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollScale fromScale={0.9} fromOpacity={0} threshold={0.2}>
            <div className="relative rounded-3xl bg-gradient-to-br from-primary-950 via-zinc-950 to-zinc-900 overflow-hidden px-8 py-16 sm:py-24 text-center">
              <div className="absolute inset-0 bg-grid-white opacity-[0.05]" />
              <div className="relative">
                <h2 className="text-display-sm sm:text-display text-white mb-8 font-extrabold tracking-tighter leading-[1.1]">
                  Start your journey <br /> with Jobly today.
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Magnetic strength={40}>
                    <Link
                      to="/jobs"
                      className="group relative inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <span className="relative">Explore positions</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={20}>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white/70 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-xl hover:bg-white/[0.04] transition-all"
                    >
                      Create account
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </ScrollScale>
        </div>
      </section>
      
      {/* Subtle footer credit */}
      <section className="pb-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-300 dark:text-white/20">
          Est. 2024 &bull; Jobly Ecosystem
        </p>
      </section>
    </div>
  );
}

