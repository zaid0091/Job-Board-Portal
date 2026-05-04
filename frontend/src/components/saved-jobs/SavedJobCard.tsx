import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

interface SavedJobItem {
  id: string;
  job: {
    id: string;
    title: string;
    slug: string;
    employer_name: string;
    employer_logo: string | null;
    category_name: string | null;
    job_type: string;
    experience_level: string;
    location: string;
    is_remote: boolean;
    salary_display: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    applications_count: number;
    days_remaining: number | null;
    is_saved: boolean;
    created_at: string;
  };
  created_at: string;
}

interface SavedJobCardProps {
  saved: SavedJobItem;
  index: number;
  onUnsave: (savedJobId: string) => void;
}

const SavedJobCard = memo(function SavedJobCard({
  saved,
  index,
  onUnsave,
}: SavedJobCardProps) {
  const job = saved.job;

  const handleUnsave = useCallback(() => {
    onUnsave(saved.id);
  }, [saved.id, onUnsave]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="bg-card rounded-xl p-5 transition-shadow duration-200"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <Link to={`/jobs/${job.slug}`} className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-ink-800 hover:text-primary-600 transition-colors truncate">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1 text-sm text-ink-400">
              <BuildingOfficeIcon className="h-4 w-4" />
              {job.employer_name}
            </span>
            <span className="flex items-center gap-1 text-sm text-ink-400">
              <MapPinIcon className="h-4 w-4" />
              {job.is_remote ? 'Remote' : job.location}
            </span>
            <span className="flex items-center gap-1 text-sm text-ink-400">
              <BriefcaseIcon className="h-4 w-4" />
              {JOB_TYPE_LABELS[job.job_type] || job.job_type}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[13px] font-medium text-ink-600">
              {job.salary_display}
            </span>
            {job.days_remaining !== null && job.days_remaining < 0 && (
              <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Expired
              </p>
            )}
            {job.days_remaining !== null && job.days_remaining === 0 && (
              <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Expires today
              </p>
            )}
            {job.days_remaining !== null && job.days_remaining > 0 && job.days_remaining <= 7 && (
              <p className="mt-2 text-micro font-medium text-red-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Expires in {job.days_remaining} day{job.days_remaining > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Link>
        <button
          onClick={handleUnsave}
          className="flex-shrink-0 p-2 rounded-lg text-primary-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Remove from saved"
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
});

export default SavedJobCard;
