import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-primary-400/30 dark:from-primary-500/[0.18]',
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn('absolute', className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[2px] border-2 border-primary-300/40 dark:border-white/[0.15]',
            'shadow-[0_8px_32px_0_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_70%)]',
            'dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]',
          )}
        />
      </motion.div>
    </motion.div>
  );
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
};

function HeroGeometric({
  badge = 'Design Collective',
  title1 = 'Elevate Your Digital Vision',
  title2 = 'Crafting Exceptional Websites',
  description = 'Crafting exceptional digital experiences through innovative design and cutting-edge technology.',
  className,
  contentClassName,
  children,
}: {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden',
        'bg-zinc-50 dark:bg-[#030303]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/15 via-transparent to-violet-400/10 blur-3xl dark:from-primary-500/[0.08] dark:to-violet-500/[0.08]" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-primary-500/35 dark:from-primary-500/[0.18]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-violet-500/30 dark:from-violet-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-primary-400/25 dark:from-primary-400/[0.12]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/25 dark:from-amber-500/[0.12]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/25 dark:from-cyan-500/[0.12]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className={cn('relative z-10 w-full', contentClassName)}>
        {children ?? (
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                custom={0}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50/80 border border-primary-200/60 dark:bg-white/[0.03] dark:border-white/[0.08] mb-8 md:mb-12"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500/80 dark:bg-primary-400/80 shrink-0" aria-hidden />
                <span className="text-sm text-primary-700 dark:text-white/60 tracking-wide">{badge}</span>
              </motion.div>

              <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-ink-900 to-ink-700 dark:from-white dark:to-white/80">
                    {title1}
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-violet-600 dark:from-primary-300 dark:via-white/90 dark:to-violet-300">
                    {title2}
                  </span>
                </h1>
              </motion.div>

              <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                <p className="text-base sm:text-lg md:text-xl text-ink-600 dark:text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                  {description}
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-zinc-50/80 dark:from-[#030303] dark:to-[#030303]/80" />
    </div>
  );
}

export { HeroGeometric, ElegantShape };
