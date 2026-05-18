import SectionBadge from '@/components/ui/SectionBadge';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import LineReveal from '@/components/ui/LineReveal';

type JobListHeroProps = {
  totalCount: number;
  loadedCount: number;
};

export default function JobListHero({ totalCount, loadedCount }: JobListHeroProps) {
  return (
    <section className="relative -mt-14 overflow-hidden border-b border-ink-900/[0.04] dark:border-white/[0.06] [mask-image:linear-gradient(to_bottom,black_calc(100%-80px),transparent_100%)]">
      {/* Light atmosphere — crossfades out in dark mode */}
      <div
        aria-hidden
        className="theme-crossfade-light pointer-events-none absolute inset-0 opacity-100 dark:opacity-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-white to-white" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.35]" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary-400/15 blur-[100px]" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-violet-400/10 blur-[80px]" />
      </div>

      {/* Dark atmosphere — crossfades in */}
      <div
        aria-hidden
        className="theme-crossfade-dark pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/25 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.06]" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-violet-500/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
        <ScrollReveal direction="up" duration={0.8} distance={16}>
          <SectionBadge label="Open roles" variant="pill" />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1} duration={0.9}>
          <h1 className="mt-6 max-w-3xl text-display-sm font-extrabold tracking-tighter text-ink-900 dark:text-white sm:text-display">
            Discover your next{' '}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-600 bg-clip-text text-transparent dark:from-primary-400 dark:via-primary-300 dark:to-violet-400">
              career move
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2} duration={0.9}>
          <p className="mt-4 max-w-xl text-body-lg leading-relaxed text-ink-500 dark:text-zinc-400">
            Curated opportunities from verified employers — filter by role, level, location, and
            remote-friendly teams.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3} duration={0.8}>
          <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                Available now
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                <AnimatedCounter value={totalCount} />
              </p>
            </div>
            {totalCount > 0 && loadedCount > 0 && (
              <>
                <div className="hidden h-10 w-px bg-ink-900/10 dark:bg-white/10 sm:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
                    Loaded
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink-700 dark:text-zinc-300">
                    {loadedCount}
                    <span className="text-ink-400 dark:text-zinc-500"> / {totalCount}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollReveal>

        <div className="mt-10">
          <LineReveal className="bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
