export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full time',
  PART_TIME: 'Part time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: 'Entry level',
  MID: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

export function formatJobSalary(job: {
  salary_min: string | null;
  salary_max: string | null;
  salary_currency: string;
  show_salary: boolean;
}): string | null {
  if (!job.show_salary || (!job.salary_min && !job.salary_max)) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.salary_currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  if (job.salary_min && job.salary_max) {
    return `${fmt(Number(job.salary_min))} – ${fmt(Number(job.salary_max))}`;
  }
  if (job.salary_min) return `From ${fmt(Number(job.salary_min))}`;
  return `Up to ${fmt(Number(job.salary_max!))}`;
}
