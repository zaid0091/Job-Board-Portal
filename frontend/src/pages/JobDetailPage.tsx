import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanitizeHTML } from '@/utils/sanitize';
import { useAppSelector } from '@/store/hooks';
import { jobsAPI } from '@/api';
import ApplicationForm from '@/components/jobs/ApplicationForm';
import Modal from '@/components/ui/Modal';
import { JobDetailSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import {
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOffice2Icon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import type { JobDetail } from '@/types';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://jobly.com';

const jobTypeToSchemaType: Record<string, string> = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACTOR',
  INTERNSHIP: 'INTERN',
  FREELANCE: 'CONTRACTOR',
  TEMPORARY: 'TEMPORARY',
};

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const jsonLd = useMemo(() => {
    if (!job) return null;

    const base = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description.replace(/<[^>]*>/g, ''),
      datePosted: job.created_at,
      validThrough: job.expires_at || job.application_deadline || undefined,
      employmentType: jobTypeToSchemaType[job.job_type] || job.job_type,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.employer.company_name,
        url: job.employer.company_website || undefined,
        logo: job.employer.company_logo ? `${SITE_URL}${job.employer.company_logo}` : undefined,
        sameAs: job.employer.company_website || undefined,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'US',
        },
      },
      applicantLocationRequirements: job.is_remote ? 'REMOTE' : undefined,
      skills: job.skills_required?.map((s) => s.name).join(', ') || undefined,
      experienceRequirements: job.experience_level || undefined,
    };

    if (job.salary_min && job.salary_max && job.show_salary) {
      const currency = job.salary_currency || 'USD';
      (base as Record<string, unknown>).baseSalary = {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: Number(job.salary_min),
          maxValue: Number(job.salary_max),
          unitText: 'YEAR',
        },
      };
    }

    return base;
  }, [job]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    jobsAPI
      .getJob(slug)
      .then((res) => {
        setJob(res);
        setApplicationStatus(res.is_applied ?? null);
        setIsSaved(res.is_saved ?? false);
      })
      .catch(() => {
        toast.error('Failed to load job details');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSaveToggle = async () => {
    if (!job) return;
    // Optimistic update
    const prev = isSaved;
    setIsSaved(!isSaved);
    try {
      if (prev) {
        await jobsAPI.unsaveJob(job.id);
        toast.success('Job removed from saved');
      } else {
        await jobsAPI.saveJob(job.id);
        toast.success('Job saved');
      }
    } catch {
      setIsSaved(prev); // revert
      toast.error('Failed to update saved status');
    }
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setApplicationStatus('PENDING');
    toast.success('Application submitted successfully!');
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-heading text-ink-900">Job not found</h2>
        <p className="mt-2 text-sm text-ink-400">This job may have been removed or the link is incorrect.</p>
        <Link to="/jobs" className="btn-primary mt-4 inline-block">
          Browse positions
        </Link>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: job.salary_currency || 'USD', maximumFractionDigits: 0 }).format(n);
    if (job.salary_min && job.salary_max) return `${fmt(Number(job.salary_min))} - ${fmt(Number(job.salary_max))}`;
    if (job.salary_min) return `From ${fmt(Number(job.salary_min))}`;
    return `Up to ${fmt(Number(job.salary_max!))}`;
  };

  const salary = formatSalary();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO
        title={job.title}
        description={`${job.job_type.replace('_', ' ')} position at ${job.employer?.company_name || 'a top company'} — ${job.is_remote ? 'Remote' : job.location}`}
        canonical={`/jobs/${job.slug}`}
        type="article"
        jsonLd={jsonLd}
        articlePublishedTime={job.created_at}
        articleModifiedTime={job.updated_at}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-2xl p-6 sm:p-8"
        style={{ boxShadow: 'var(--card-shadow-md)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-sm text-ink-900">{job.title}</h1>
            <Link 
              to={`/employers/${job.employer.id}`} 
              className="mt-2 flex items-center text-ink-500 hover:text-primary-600 transition-colors group"
            >
              <BuildingOffice2Icon className="h-4 w-4 mr-1.5 text-ink-400 group-hover:text-primary-500 transition-colors" />
              <span className="text-sm font-medium">{job.employer.company_name}</span>
            </Link>
          </div>
          {isAuthenticated && user?.role === 'SEEKER' && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={handleSaveToggle}
              className="text-ink-300 hover:text-primary-600 transition-colors"
            >
              {isSaved ? (
                <BookmarkSolid className="h-6 w-6 text-primary-600" />
              ) : (
                <BookmarkOutline className="h-6 w-6" />
              )}
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <span className="inline-flex items-center text-micro px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 font-medium">
            <BriefcaseIcon className="h-3 w-3 mr-1 inline" />
            {job.job_type.replace('_', ' ')}
          </span>
          {job.experience_level && (
            <span className="inline-flex items-center text-micro px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 font-medium">{job.experience_level}</span>
          )}
          <span className="inline-flex items-center text-micro px-2 py-0.5 rounded-md bg-surface-100 text-ink-600 font-medium">
            <MapPinIcon className="h-3 w-3 mr-1 inline" />
            {job.is_remote ? 'Remote' : job.location}
          </span>
          {salary && (
            <span className="inline-flex items-center text-micro px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
              <CurrencyDollarIcon className="h-3 w-3 mr-1 inline" />
              {salary}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 flex flex-wrap gap-4 text-[13px] text-ink-400"
        >
          <span className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
          {job.application_deadline && (
            <span className="flex items-center">
              <ClockIcon className="h-3.5 w-3.5 mr-1" />
              Deadline: {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          )}
          <span>{job.applications_count} application{job.applications_count !== 1 ? 's' : ''}</span>
          <span>{job.views_count} view{job.views_count !== 1 ? 's' : ''}</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6 overflow-hidden" style={{ boxShadow: 'var(--card-shadow-md)' }}>
            <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Description</h2>
            <div
              className="prose prose-sm max-w-none text-ink-500 text-justify break-words"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.description) }}
            />
          </div>

          {job.requirements && (
            <div className="bg-card rounded-2xl p-6 overflow-hidden" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Requirements</h2>
              <div
                className="prose prose-sm max-w-none text-ink-500 break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.requirements) }}
              />
            </div>
          )}

          {job.responsibilities && (
            <div className="bg-card rounded-2xl p-6 overflow-hidden" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Responsibilities</h2>
              <div
                className="prose prose-sm max-w-none text-ink-500 break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.responsibilities) }}
              />
            </div>
          )}

          {job.benefits && (
            <div className="bg-card rounded-2xl p-6 overflow-hidden" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <h2 className="text-[15px] font-semibold text-ink-800 mb-4">Benefits</h2>
              <div
                className="prose prose-sm max-w-none text-ink-500 break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.benefits) }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="bg-card rounded-2xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <h3 className="text-[13px] font-semibold text-ink-700 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_required.map((skill) => (
                  <span key={skill.id} className="text-micro font-medium px-2 py-0.5 rounded-md bg-surface-100 text-ink-600">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && user?.role === 'SEEKER' && job.status === 'ACTIVE' && (
            <div className="bg-card rounded-2xl p-6" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              {applicationStatus === 'HIRED' ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white opacity-90 cursor-not-allowed"
                >
                  Hired
                </button>
              ) : applicationStatus ? (
                <button
                  disabled
                  className="btn-primary w-full py-2.5 opacity-60 cursor-not-allowed"
                >
                  Applied &middot; {applicationStatus}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-primary w-full py-2.5"
                  >
                    Apply now
                  </button>
                  
                  <Modal
                    isOpen={showApplicationForm}
                    onClose={() => setShowApplicationForm(false)}
                    title={`Apply for ${job.title}`}
                    maxWidth="lg"
                  >
                    <ApplicationForm
                      jobId={job.id}
                      onSuccess={handleApplicationSuccess}
                      onCancel={() => setShowApplicationForm(false)}
                    />
                  </Modal>
                </>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-card rounded-2xl p-6 text-center" style={{ boxShadow: 'var(--card-shadow-md)' }}>
              <p className="text-[13px] text-ink-500 mb-3">Sign in to apply for this position</p>
              <Link to="/login" className="btn-primary w-full inline-block text-center py-2.5">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
