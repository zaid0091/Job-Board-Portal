import type { ReactNode } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionBadge from '@/components/ui/SectionBadge';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';

export type MarketingHeroProps = {
  badge: string;
  title: ReactNode;
  description: string;
  className?: string;
};

const HERO_MASK =
  'min-h-0 pt-32 pb-20 sm:pt-48 sm:pb-32 -mt-14 [mask-image:linear-gradient(to_bottom,black_calc(100%-80px),transparent_100%)]';

export default function MarketingHero({
  badge,
  title,
  description,
  className,
}: MarketingHeroProps) {
  return (
    <HeroGeometric className={className ?? HERO_MASK} contentClassName="px-4 sm:px-6">
      <div className="relative mx-auto max-w-5xl text-center">
        <ScrollReveal direction="up" duration={1} distance={20}>
          <SectionBadge label={badge} variant="pill" className="mb-8" />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2} duration={1}>
          <h1 className="text-display-sm sm:text-display lg:text-display-lg mx-auto max-w-4xl font-extrabold leading-[1.1] tracking-tighter text-ink-900 dark:text-white">
            {title}
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.4} duration={1}>
          <p className="mx-auto mt-8 max-w-2xl text-body-lg leading-relaxed text-ink-600 dark:text-white/50">
            {description}
          </p>
        </ScrollReveal>
      </div>
    </HeroGeometric>
  );
}
