import { Skill } from './job';

export interface EmployerProfile {
  id: string;
  company_name: string;
  company_logo: string | null;
  company_website: string;
  company_size: string;
  industry: string;
  location: string;
  description: string;
  founded_year: number | null;
  is_verified: boolean;
  total_jobs_posted: number;
  active_jobs_count: number;
}

export interface EmployerProfilePublic {
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

export interface Experience {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  grade: string;
}

export interface SeekerProfile {
  id: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  avatar: string | null;
  resume: string | null;
  phone: string;
  location: string;
  experience_years: number;
  skills: Skill[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  is_open_to_work: boolean;
  expected_salary_min: string | null;
  expected_salary_max: string | null;
  experiences: Experience[];
  educations: Education[];
}

export interface ResumeParseJob {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'REVIEW_READY' | 'FAILED' | 'APPLIED' | 'DISCARDED';
  progress: number;
  error_code: string;
  error_message: string;
  parser_version: string;
  llm_model: string;
  pipeline_mode: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface ParsedSkill {
  name: string;
  confidence?: number;
  source?: string;
}

export interface ParsedExperience {
  company_name: string;
  job_title: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  confidence?: number;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  confidence?: number;
}

export interface ResumeParsePreview {
  job: ResumeParseJob;
  summary: string;
  location: string;
  skills: ParsedSkill[];
  experiences: ParsedExperience[];
  educations: ParsedEducation[];
  confidence: Record<string, number>;
  warnings: string[];
  normalized_payload: Record<string, unknown>;
}
