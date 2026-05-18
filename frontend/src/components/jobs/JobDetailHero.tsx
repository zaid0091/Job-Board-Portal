import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid, StarIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionBadge from '@/components/ui/SectionBadge';
import LineReveal from '@/components/ui/LineReveal';
import { EXPERIENCE_LABELS, JOB_TYPE_LABELS } from '@/components/jobs/jobDetailLabels';
import type { JobDetail } from '@/types';

type JobDetailHeroProps = {
  job: JobDetail;
  salary: string | null;
  isExpired: boolean;
  showSave: boolean;
  isSaved: boolean;
  onSaveToggle: () => void;
};

export default function JobDetailHero({
  job,
  salary,
  isExpired,
  showSave,
  isSaved,
  onSaveToggle,
}: JobDetailHeroProps) {
  return (
    <section className="relative -mt-14 overflow-hidden border-b border-ink-900/[0.04] dark:border-white/[0.06]">
      <div
        aria-hidden
        className="theme-crossfade-light pointer-events-none absolute inset-0 opacity-100 dark:opacity-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 via-white to-white" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.3]" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-primary-400/15 blur-[90px]" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-400/10 blur-[80px]" />
      </div>
      <div
        aria-hidden
        className="theme-crossfade-dark pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.05]" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28">
        <ScrollReveal direction="up" duration={0.6} distance={12}>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to positions
          </Link>
        </ScrollReveal>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            {job.employer.company_logo ? (
              <img
                src={job.employer.company_logo}
                alt=""
                className="h-14 w-14 flex-shrink-0 rounded-2xl object-cover ring-1 ring-ink-900/[0.08] dark:ring-white/10 sm:h-16 sm:w-16"
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 ring-1 ring-ink-900/[0.06] dark:from-primary-950/50 dark:to-violet-950/30 dark:ring-white/10 sm:h-16 sm:w-16">
                <BuildingOffice2Icon className="h-7 w-7 text-primary-600/70 dark:text-primary-400/80" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <ScrollReveal direction="up" delay={0.05}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <SectionBadge label="Role details" variant="pill" />
                  {job.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400">
                      <StarIcon className="h-3 w-3" />
                      Featured
                    </span>
                  )}
                  {isExpired && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-red-500/20 dark:bg-red-950/40 dark:text-red-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      Closed
                    </span>
                  )}
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.1}>
                <h1 className="text-display-sm font-extrabold tracking-tighter text-ink-900 dark:text-white sm:text-display">
                  {job.title}
                </h1>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.15}>
                <Link
                  to={`/employers/${job.employer.id}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors hover:text-primary-600 dark:text-zinc-300 dark:hover:text-primary-400"
                >
                  {job.employer.company_name}
                  {job.employer.is_verified && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                      Verified
                    </span>
                  )}
                </Link>
              </ScrollReveal>
            </div>
          </div>

          {showSave && (
            <ScrollReveal direction="left" delay={0.2}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onSaveToggle}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-900/[0.08] bg-white/60 text-ink-400 backdrop-blur-sm transition-colors hover:border-primary-200 hover:text-primary-600 dark:border-white/10 dark:bg-zinc-900/50 dark:hover:text-primary-400"
                aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
              >
                {isSaved ? (
                  <BookmarkSolid className="h-5 w-5 text-primary-600" />
                ) : (
                  <BookmarkOutline className="h-5 w-5" />
                )}
              </motion.button>
            </ScrollReveal>
          )}
        </div>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-800 ring-1 ring-inset ring-primary-600/10 dark:bg-primary-950/40 dark:text-primary-300">
              <BriefcaseIcon className="h-3.5 w-3.5" />
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </span>
            {job.experience_level && (
              <span className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-800 ring-1 ring-inset ring-violet-600/10 dark:bg-violet-950/40 dark:text-violet-300">
                {EXPERIENCE_LABELS[job.experience_level] ?? job.experience_level}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-900/5 dark:bg-zinc-800/60 dark:text-zinc-200">
              <MapPinIcon className="h-3.5 w-3.5" />
              {job.is_remote ? 'Remote' : job.location}
            </span>
            {salary && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                {salary}
              </span>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.25}>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-primary-500/60" />
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
            {job.application_deadline && (
              <span
                className={`inline-flex items-center gap-1.5 ${isExpired ? 'font-semibold text-red-600 dark:text-red-400' : ''}`}
              >
                <ClockIcon className="h-4 w-4" />
                {isExpired ? 'Expired' : 'Deadline'}{' '}
                {new Date(job.application_deadline).toLocaleDateString()}
              </span>
            )}
            <span>
              {job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''}
            </span>
            <span>
              {job.views_count} view{job.views_count !== 1 ? 's' : ''}
            </span>
          </div>
        </ScrollReveal>

        <div className="mt-8">
          <LineReveal className="bg-gradient-to-r from-transparent via-primary-500/25 to-transparent" />
        </div>
      </div>
    </section>
  );
}
