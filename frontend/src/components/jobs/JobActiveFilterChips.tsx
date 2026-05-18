import { XMarkIcon } from '@heroicons/react/20/solid';
import type { JobFilters } from '@/types';

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full time',
  PART_TIME: 'Part time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: 'Entry level',
  MID: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

const ORDERING_LABELS: Record<string, string> = {
  '-date': 'Newest',
  date: 'Oldest',
  '-salary': 'Highest salary',
  salary: 'Lowest salary',
  '-views': 'Most viewed',
};

type FilterKey = keyof Omit<JobFilters, 'page'>;

type Chip = { key: FilterKey; label: string };

export function buildActiveFilterChips(filters: Omit<JobFilters, 'page'>): Chip[] {
  const chips: Chip[] = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `"${filters.search}"` });
  }
  if (filters.job_type) {
    chips.push({
      key: 'job_type',
      label: JOB_TYPE_LABELS[filters.job_type] ?? filters.job_type,
    });
  }
  if (filters.experience_level) {
    chips.push({
      key: 'experience_level',
      label: EXPERIENCE_LABELS[filters.experience_level] ?? filters.experience_level,
    });
  }
  if (filters.location) {
    chips.push({ key: 'location', label: filters.location });
  }
  if (filters.is_remote) {
    chips.push({ key: 'is_remote', label: 'Remote only' });
  }
  if (filters.ordering) {
    chips.push({
      key: 'ordering',
      label: ORDERING_LABELS[filters.ordering] ?? filters.ordering,
    });
  }

  return chips;
}

type JobActiveFilterChipsProps = {
  filters: Omit<JobFilters, 'page'>;
  onRemove: (key: FilterKey) => void;
  onClearAll: () => void;
};

export default function JobActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: JobActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">
        Active
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-[12px] font-medium text-primary-800 transition-all hover:border-primary-300 hover:bg-primary-100 dark:border-primary-800/50 dark:bg-primary-950/40 dark:text-primary-200 dark:hover:bg-primary-950/60"
        >
          {chip.label}
          <XMarkIcon className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[12px] font-medium text-ink-500 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
      >
        Clear all
      </button>
    </div>
  );
}
