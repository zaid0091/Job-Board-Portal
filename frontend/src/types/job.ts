export interface JobCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent: number | null;
  job_count: number;
  children: JobCategory[];
}

export interface Skill {
  id: number;
  name: string;
  slug: string;
  category: string;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'TEMPORARY';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'EXPIRED';

export interface JobListItem {
  id: string;
  title: string;
  slug: string;
  employer_name: string;
  employer_logo: string | null;
  category_name: string | null;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string;
  is_remote: boolean;
  salary_display: string;
  status: JobStatus;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  days_remaining: number | null;
  is_saved: boolean;
  created_at: string;
}

export interface EmployerPublicProfile {
  id: string;
  company_name: string;
  company_logo: string | null;
  company_website: string;
  company_size: string;
  industry: string;
  location: string;
  description: string;
  is_verified: boolean;
  active_jobs_count: number;
}

export interface JobDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  employer: EmployerPublicProfile;
  category: JobCategory | null;
  skills_required: Skill[];
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string;
  is_remote: boolean;
  salary_min: string | null;
  salary_max: string | null;
  salary_currency: string;
  show_salary: boolean;
  salary_display: string;
  status: JobStatus;
  application_deadline: string | null;
  expires_at: string | null;
  is_featured: boolean;
  is_expired: boolean;
  views_count: number;
  applications_count: number;
  days_remaining: number | null;
  is_saved: boolean;
  is_applied: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobCreateData {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  category?: number;
  skills_required?: string[];
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  show_salary?: boolean;
  status: JobStatus;
  application_deadline?: string;
}

export interface JobFilters {
  search?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  is_remote?: boolean;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  category_slug?: string;
  skills?: string;
  ordering?: string;
  employer?: string;
  page?: number;
}
