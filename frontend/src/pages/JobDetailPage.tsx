import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sanitizeHTML } from '@/utils/sanitize';
import { useAppSelector } from '@/store/hooks';
import { jobsAPI } from '@/api';
import ApplicationForm from '@/components/jobs/ApplicationForm';
import JobDetailHero from '@/components/jobs/JobDetailHero';
import JobDetailSection from '@/components/jobs/JobDetailSection';
import { formatJobSalary } from '@/components/jobs/jobDetailLabels';
import Modal from '@/components/ui/Modal';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionBadge from '@/components/ui/SectionBadge';
import { JobDetailSkeleton } from '@/components/ui/Skeleton';
import SEO from '@/components/SEO';
import { BuildingOffice2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
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

const PROSE_CLASS =
  'prose prose-sm max-w-none text-ink-600 dark:prose-invert dark:text-zinc-400 prose-headings:text-ink-900 dark:prose-headings:text-white prose-a:text-primary-600 break-words';

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

  const isExpired = useMemo(() => {
    if (!job) return false;
    if (job.application_deadline) {
      return new Date(job.application_deadline) < new Date();
    }
    return job.is_expired || false;
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
      setIsSaved(prev);
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
      <div className="bg-page min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-display-sm font-extrabold tracking-tighter text-ink-900 dark:text-white">
            Job not found
          </h2>
          <p className="mt-3 text-sm text-ink-500 dark:text-zinc-400">
            This job may have been removed or the link is incorrect.
          </p>
          <Link to="/jobs" className="btn-primary mt-6 inline-block">
            Browse positions
          </Link>
        </div>
      </div>
    );
  }

  const salary = formatJobSalary(job);
  const showSave = Boolean(isAuthenticated && user?.role === 'SEEKER');

  const contentSections: { key: string; label: string; html: string }[] = [
    { key: 'description', label: 'Description', html: job.description },
    ...(job.requirements
      ? [{ key: 'requirements', label: 'Requirements', html: job.requirements }]
      : []),
    ...(job.responsibilities
      ? [{ key: 'responsibilities', label: 'Responsibilities', html: job.responsibilities }]
      : []),
    ...(job.benefits ? [{ key: 'benefits', label: 'Benefits', html: job.benefits }] : []),
  ];

  return (
    <div className="min-h-screen bg-page">
      <SEO
        title={job.title}
        description={`${job.job_type.replace('_', ' ')} position at ${job.employer?.company_name || 'a top company'} — ${job.is_remote ? 'Remote' : job.location}`}
        canonical={`/jobs/${job.slug}`}
        type="article"
        jsonLd={jsonLd}
        articlePublishedTime={job.created_at}
        articleModifiedTime={job.updated_at}
      />

      <JobDetailHero
        job={job}
        salary={salary}
        isExpired={isExpired}
        showSave={showSave}
        isSaved={isSaved}
        onSaveToggle={handleSaveToggle}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="space-y-6 lg:col-span-2">
            {contentSections.map((section, index) => (
              <JobDetailSection key={section.key} label={section.label} delay={index * 0.05}>
                <div
                  className={`${PROSE_CLASS} ${section.key === 'description' ? 'text-justify' : ''}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.html) }}
                />
              </JobDetailSection>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {job.skills_required && job.skills_required.length > 0 && (
              <ScrollReveal direction="up" delay={0.1} duration={0.7}>
                <PremiumCard>
                  <div className="p-6">
                    <SectionBadge label="Skills" className="mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-lg bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-900/5 dark:bg-zinc-800/60 dark:text-zinc-200"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </PremiumCard>
              </ScrollReveal>
            )}

            <ScrollReveal direction="up" delay={0.15} duration={0.7}>
              <PremiumCard className="overflow-hidden">
                <div className="border-b border-ink-900/[0.04] bg-gradient-to-br from-primary-50/80 via-white to-violet-50/40 p-6 dark:border-white/[0.06] dark:from-primary-950/40 dark:via-zinc-900 dark:to-violet-950/20">
                  <SectionBadge label="Apply" className="mb-3" />
                  <p className="text-sm text-ink-600 dark:text-zinc-400">
                    {isExpired
                      ? 'This role is no longer accepting applications.'
                      : 'Ready to join the team? Submit your application in a few minutes.'}
                  </p>
                </div>

                <div className="p-6">
                  {isAuthenticated && user?.role === 'SEEKER' && job.status === 'ACTIVE' ? (
                    <>
                      {applicationStatus === 'HIRED' ? (
                        <button
                          type="button"
                          disabled
                          className="w-full cursor-not-allowed rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white opacity-90"
                        >
                          Hired
                        </button>
                      ) : applicationStatus ? (
                        <button
                          type="button"
                          disabled
                          className="btn-primary w-full cursor-not-allowed py-3 opacity-60"
                        >
                          Applied · {applicationStatus.replace('_', ' ')}
                        </button>
                      ) : isExpired ? (
                        <button
                          type="button"
                          disabled
                          className="w-full cursor-not-allowed rounded-xl bg-ink-100 py-3 text-sm font-medium text-ink-400 dark:bg-zinc-800 dark:text-zinc-500"
                        >
                          Application deadline has passed
                        </button>
                      ) : (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowApplicationForm(true)}
                          className="btn-primary w-full py-3 text-sm font-semibold"
                        >
                          Apply now
                        </motion.button>
                      )}
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <p className="mb-4 text-center text-[13px] text-ink-500 dark:text-zinc-400">
                        Sign in to apply for this position
                      </p>
                      <Link
                        to="/login"
                        className="btn-primary block w-full py-3 text-center text-sm font-semibold"
                      >
                        Sign in to apply
                      </Link>
                    </>
                  ) : null}

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
                </div>
              </PremiumCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} duration={0.7}>
              <PremiumCard>
                <div className="flex items-start gap-4 p-6">
                  {job.employer.company_logo ? (
                    <img
                      src={job.employer.company_logo}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-ink-900/[0.08] dark:ring-white/10"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40">
                      <BuildingOffice2Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
                      Employer
                    </p>
                    <p className="mt-1 font-semibold text-ink-900 dark:text-white">
                      {job.employer.company_name}
                    </p>
                    {job.employer.industry && (
                      <p className="mt-0.5 text-xs text-ink-500 dark:text-zinc-400">
                        {job.employer.industry}
                      </p>
                    )}
                    <Link
                      to={`/employers/${job.employer.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      View company profile
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </PremiumCard>
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
