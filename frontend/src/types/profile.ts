import { Skill } from './job';

export interface EmployerProfile {
  id: string;
  company_name: string;
  logo: string | null;
  website: string;
  company_size: string;
  industry: string;
  location: string;
  description: string;
  founded_year: number | null;
  is_verified: boolean;
  total_jobs_posted: number;
  active_jobs_count: number;
}

export interface Experience {
  id: number;
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

export interface Education {
  id: number;
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
