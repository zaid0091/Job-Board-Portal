import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profilesAPI, jobsAPI } from '@/api';
import JobCard from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import {
  GlobeAltIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { EmployerProfilePublic, JobListItem } from '@/types';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://jobly.com';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<EmployerProfilePublic | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const jsonLd = useMemo(() => {
    if (!company) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.company_name,
      description: company.description.replace(/<[^>]*>/g, ''),
      url: company.company_website || `${SITE_URL}/employers/${company.id}`,
      logo: company.company_logo ? `${SITE_URL}${company.company_logo}` : undefined,
      sameAs: company.company_website ? [company.company_website] : [],
      address: {
        '@type': 'PostalAddress',
        addressLocality: company.location,
      },
      numberOfEmployees: company.company_size || undefined,
      industry: company.industry || undefined,
    };
  }, [company]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    profilesAPI
      .getEmployerPublic(id)
      .then((res) => {
        setCompany(res);
      })
      .catch(() => {
        toast.error('Failed to load company profile');
      })
      .finally(() => setLoading(false));

    setLoadingJobs(true);
    jobsAPI
      .getJobs({ employer: id }) // Note: Backend JobFilter uses 'employer' for employer__user__id or similar. 
                                 // Let's ensure our JobFilter supports employer__id too.
      .then((res) => {
        setJobs(res.results);
      })
      .catch(() => {
        console.error('Failed to load company jobs');
      })
      .finally(() => setLoadingJobs(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-heading text-ink-900">Company not found</h2>
        <p className="mt-2 text-sm text-ink-400">The company you are looking for does not exist or has been removed.</p>
        <Link to="/jobs" className="btn-primary mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO 
        title={company.company_name} 
        description={`${company.company_name} — ${company.active_jobs_count} open position${company.active_jobs_count !== 1 ? 's' : ''} on Jobly. ${company.industry || ''} company based in ${company.location}.`.trim()}
        canonical={`/employers/${company.id}`}
        jsonLd={jsonLd}
      />
      
      {/* Company Header */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 relative overflow-hidden" style={{ boxShadow: 'var(--card-shadow-md)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start gap-6 relative">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-surface-50 p-2 border border-ink-900/[0.05] shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
            {company.company_logo ? (
              <img src={company.company_logo} alt={company.company_name} className="h-full w-full object-contain" />
            ) : (
              <BuildingOfficeIcon className="h-10 w-10 text-ink-200" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-display-sm text-ink-900 truncate">{company.company_name}</h1>
              {company.is_verified && (
                <CheckBadgeIcon className="h-6 w-6 text-primary-500" title="Verified Company" />
              )}
            </div>
            
            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-ink-500">
              <span className="flex items-center gap-1.5">
                <BuildingOfficeIcon className="h-4 w-4 text-ink-300" />
                {company.industry || 'General'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-ink-300" />
                {company.location || 'Unknown location'}
              </span>
              <span className="flex items-center gap-1.5">
                <UserGroupIcon className="h-4 w-4 text-ink-300" />
                {company.company_size || 'Startup'}
              </span>
              {company.company_website && (
                <a 
                  href={company.company_website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-ink-900/[0.05]">
          <h2 className="text-[15px] font-semibold text-ink-800 mb-3">About the company</h2>
          <p className="text-[14px] text-ink-500 leading-relaxed max-w-3xl whitespace-pre-wrap">
            {company.description || 'No description available for this company.'}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading text-ink-900">
            Open Positions 
            <span className="ml-2 text-sm font-normal text-ink-400">({company.active_jobs_count})</span>
          </h2>
        </div>

        {loadingJobs ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border border-dashed border-ink-900/[0.1]">
            <p className="text-ink-400">No open positions at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
