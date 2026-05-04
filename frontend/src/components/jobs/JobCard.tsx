import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import type { JobListItem } from '@/types';

interface JobCardProps {
  job: JobListItem;
}

const jobTypeBadge: Record<string, string> = {
  FULL_TIME: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  PART_TIME: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  CONTRACT: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  INTERNSHIP: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  FREELANCE: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
  TEMPORARY: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
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
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/jobs/${job.slug}`}
        className={`group block rounded-xl p-5 transition-all duration-200 ease-spring ${
          job.is_featured
            ? 'bg-primary-50 dark:bg-primary-950/30'
            : 'bg-card hover:bg-surface-50/50 dark:hover:bg-surface-100/50'
        }`}
        style={{
          boxShadow: job.is_featured
            ? '0 0 0 1px rgba(124,58,237,0.15), 0 1px 4px rgba(124,58,237,0.06)'
            : 'var(--card-shadow)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                loading="lazy"
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                style={{ boxShadow: 'var(--card-shadow)' }}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="h-5 w-5 text-ink-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-ink-800 truncate group-hover:text-primary-600 transition-colors">
                  {job.title}
                </h3>
                {job.is_featured && (
                  <StarIcon className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[13px] text-ink-400 mt-0.5">{job.employer_name}</p>
            </div>
          </div>
          <span className={`hidden sm:inline-flex text-micro px-2 py-0.5 rounded-md font-medium ${jobTypeBadge[job.job_type] || 'bg-surface-100 text-ink-500'}`}>
            {jobTypeLabel[job.job_type] || job.job_type}
          </span>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-400">
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5 text-ink-300" />
            {job.location}
            {job.is_remote && <span className="text-emerald-600 font-medium">(Remote)</span>}
          </span>
          <span className="flex items-center gap-1">
            <CurrencyDollarIcon className="h-3.5 w-3.5 text-ink-300" />
            {job.salary_display}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 text-ink-300" />
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
          <span className={`sm:hidden text-micro px-2 py-0.5 rounded-md font-medium ${jobTypeBadge[job.job_type] || 'bg-surface-100 text-ink-500'}`}>
            {jobTypeLabel[job.job_type] || job.job_type}
          </span>
        </div>

        {job.days_remaining !== null && job.days_remaining < 0 && (
          <p className="mt-3 text-micro font-medium text-red-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Expired
          </p>
        )}
        {job.days_remaining !== null && job.days_remaining === 0 && (
          <p className="mt-3 text-micro font-medium text-red-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Expires today
          </p>
        )}
        {job.days_remaining !== null && job.days_remaining > 0 && job.days_remaining <= 7 && (
          <p className="mt-3 text-micro font-medium text-red-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Expires in {job.days_remaining} day{job.days_remaining > 1 ? 's' : ''}
          </p>
        )}
      </Link>
    </motion.div>
  );
});
