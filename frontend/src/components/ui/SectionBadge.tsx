import { cn } from '@/lib/utils';

type SectionBadgeProps = {
  label: string;
  className?: string;
  /** Pill style (hero eyebrow) vs framed label (section headers). */
  variant?: 'pill' | 'framed';
};

export default function SectionBadge({
  label,
  className,
  variant = 'framed',
}: SectionBadgeProps) {
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-primary-200/60',
          'bg-primary-50/80 px-3 py-1 backdrop-blur-sm',
          'dark:border-white/[0.08] dark:bg-white/[0.06]',
          className,
        )}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500 dark:bg-primary-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-700 dark:text-white/60">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center border border-primary-200 px-6 py-2',
        'bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-950/20',
        className,
      )}
    >
      <span className="absolute -top-[1.5px] -left-[1.5px] z-10 h-[3px] w-[3px] bg-primary-500" />
      <span className="absolute -top-[1.5px] -right-[1.5px] z-10 h-[3px] w-[3px] bg-primary-500" />
      <span className="absolute -bottom-[1.5px] -left-[1.5px] z-10 h-[3px] w-[3px] bg-primary-500" />
      <span className="absolute -bottom-[1.5px] -right-[1.5px] z-10 h-[3px] w-[3px] bg-primary-500" />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-200 md:text-[11px]">
        {label}
      </p>
    </div>
  );
}
