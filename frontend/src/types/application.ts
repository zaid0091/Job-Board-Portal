import { JobListItem } from './job';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationListItem {
  id: string;
  job_title: string;
  job_slug: string;
  company_name: string;
  applicant_name: string;
  applicant_email: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatusLog {
  id: number;
  from_status: ApplicationStatus;
  to_status: ApplicationStatus;
  changed_by_name: string;
  notes: string;
  created_at: string;
}

export interface ApplicationDetail {
  id: string;
  job: JobListItem;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  resume: string | null;
  status: ApplicationStatus;
  employer_notes: string;
  expected_salary: string | null;
  available_from: string | null;
  status_logs: ApplicationStatusLog[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreateData {
  job: string;
  cover_letter?: string;
  cover_letter_draft_id?: string;
  resume?: File;
  expected_salary?: number;
  available_from?: string;
}

export interface CoverLetterPreviewResponse {
  draft_id: string;
  cover_letter: string;
  highlights: string[];
  cached: boolean;
  generator: 'template' | 'llm';
  profile_hash: string;
  disclaimer: string;
}
