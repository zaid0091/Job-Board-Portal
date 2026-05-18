import { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import PremiumCard from '@/components/ui/PremiumCard';
import type { JobListItem } from '@/types';

interface JobCardProps {
  job: JobListItem;
}

const jobTypeBadge: Record<string, string> = {
  FULL_TIME: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-400',
  PART_TIME: 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-400',
  CONTRACT: 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-400',
  INTERNSHIP: 'bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-violet-950/40 dark:text-violet-400',
  FREELANCE: 'bg-pink-50 text-pink-700 ring-pink-600/10 dark:bg-pink-950/40 dark:text-pink-400',
  TEMPORARY: 'bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-950/40 dark:text-orange-400',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

export default memo(function JobCard({ job }: JobCardProps) {
  const isExpired = job.days_remaining !== null && job.days_remaining < 0;
  const isUrgent =
    job.days_remaining !== null && job.days_remaining >= 0 && job.days_remaining <= 7;

  return (
    <PremiumCard
      className={job.is_featured ? 'ring-1 ring-primary-500/25' : ''}
      spotlightColor={
        job.is_featured ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.12)'
      }
    >
      <Link
        to={`/jobs/${job.slug}`}
        className={`group block p-5 sm:p-6 ${isExpired ? 'opacity-75' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                loading="lazy"
                className="h-12 w-12 flex-shrink-0 rounded-xl object-cover ring-1 ring-ink-900/[0.06] dark:ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 ring-1 ring-ink-900/[0.06] dark:from-primary-950/50 dark:to-violet-950/30 dark:ring-white/10">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-500/70 dark:text-primary-400/80" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[16px] font-bold tracking-tight text-ink-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {job.title}
                </h3>
                {job.is_featured && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400">
                    <StarIcon className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] font-medium text-ink-500 dark:text-zinc-400">
                {job.employer_name}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <span
              className={`hidden rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex ${
                jobTypeBadge[job.job_type] || 'bg-surface-100 text-ink-500 ring-ink-900/5'
              }`}
            >
              {jobTypeLabel[job.job_type] || job.job_type}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900/[0.03] text-ink-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:opacity-100 dark:bg-white/[0.04] dark:group-hover:bg-primary-950/50 dark:group-hover:text-primary-400">
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-900/[0.04] pt-4 text-[13px] text-ink-500 dark:border-white/[0.06] dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 text-primary-500/60 dark:text-primary-400/60" />
            {job.location}
            {job.is_remote && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Remote</span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <CurrencyDollarIcon className="h-4 w-4 text-primary-500/60 dark:text-primary-400/60" />
            <span className="font-medium text-ink-700 dark:text-zinc-300">{job.salary_display}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-ink-300 dark:text-zinc-500" />
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset sm:hidden ${
              jobTypeBadge[job.job_type] || 'bg-surface-100 text-ink-500'
            }`}
          >
            {jobTypeLabel[job.job_type] || job.job_type}
          </span>
        </div>

        {isExpired && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Expired
          </p>
        )}
        {!isExpired && job.days_remaining === 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Expires today
          </p>
        )}
        {!isExpired && isUrgent && job.days_remaining !== null && job.days_remaining > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            {job.days_remaining} day{job.days_remaining > 1 ? 's' : ''} left
          </p>
        )}
      </Link>
    </PremiumCard>
  );
});
