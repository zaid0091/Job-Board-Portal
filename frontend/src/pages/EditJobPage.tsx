import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobsAPI } from '@/api';
import { profilesAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import SEO from '@/components/SEO';
import useUnsavedChanges from '@/hooks/useUnsavedChanges';
import toast from 'react-hot-toast';
import type { JobCategory, Skill, JobDetail } from '@/types';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  job_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY']),
  experience_level: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional(),
  location: z.string().min(1, 'Location is required'),
  is_remote: z.boolean(),
  salary_min: z.number().min(0).optional().or(z.literal('')),
  salary_max: z.number().min(0).optional().or(z.literal('')),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
  category_id: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function EditJobPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobDetail | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      job_type: 'FULL_TIME',
      is_remote: false,
    },
  });

  const blocker = useUnsavedChanges(isDirty && !submitting);

  // Load job data and categories/skills
  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobData, categoriesData, skillsData] = await Promise.all([
          jobsAPI.getJob(slug!),
          jobsAPI.getCategories(),
          profilesAPI.getSkills(),
        ]);

        setJob(jobData);
        setCategories(categoriesData);
        setSkills(skillsData);

        // Map skills to their IDs
        const jobSkillIds = jobData.skills_required
          .map((skill) => skillsData.find((s: Skill) => s.slug === skill.slug)?.id)
          .filter((id): id is number => id !== undefined);
        setSelectedSkills(jobSkillIds);

        // Reset form with job data
        reset({
          title: jobData.title,
          description: jobData.description,
          job_type: jobData.job_type,
          experience_level: jobData.experience_level,
          location: jobData.location,
          is_remote: jobData.is_remote,
          salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : undefined,
          salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : undefined,
          requirements: jobData.requirements,
          responsibilities: jobData.responsibilities,
          benefits: jobData.benefits,
          deadline: jobData.application_deadline || undefined,
          category_id: jobData.category?.id?.toString(),
        });
      } catch {
        toast.error('Failed to load job data');
        navigate('/employer/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug, reset, navigate]);

  const onSubmit = async (data: JobFormData) => {
    if (!slug) return;

    setSubmitting(true);
    try {
      const { deadline, category_id, experience_level, ...rest } = data;
      const payload = {
        ...rest,
        salary_min: data.salary_min === '' ? undefined : data.salary_min,
        salary_max: data.salary_max === '' ? undefined : data.salary_max,
        experience_level: experience_level || undefined,
        application_deadline: deadline || undefined,
        category: category_id ? parseInt(category_id) : undefined,
        skills_required: selectedSkills
          .map((id) => skills.find((s) => s.id === id)?.slug)
          .filter((slug): slug is string => Boolean(slug)),
      };
      await jobsAPI.updateJob(slug, payload);
      toast.success('Job updated successfully!');
      navigate('/employer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update job';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center py-20">
          <p className="text-ink-400">Job not found</p>
          <button onClick={() => navigate('/employer/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title={`Edit Job - ${job.title}`} description="Edit your job listing." />
      <h1 className="text-display-sm text-ink-900 mb-8">Edit position</h1>

      <UnsavedChangesModal
        open={blocker.isBlocked}
        onConfirm={() => blocker.proceed()}
        onCancel={() => blocker.reset()}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card rounded-2xl p-6 sm:p-8 space-y-5"
        style={{ boxShadow: 'var(--card-shadow-md)' }}
      >
        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Job title *</label>
          <input type="text" className="input-field" {...register('title')} />
          {errors.title && <p className="mt-1 text-[13px] text-red-500">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Job type *</label>
            <select className="input-field" {...register('job_type')}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Experience level</label>
            <select className="input-field" {...register('experience_level')}>
              <option value="">Select</option>
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Location *</label>
          <input type="text" className="input-field" {...register('location')} />
          {errors.location && (
            <p className="mt-1 text-[13px] text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div className="flex items-center pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-ink-200 text-primary-600" {...register('is_remote')} />
            <span className="text-[13px] font-medium text-ink-600">Remote position</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Min salary</label>
            <input
              type="number"
              min={0}
              className="input-field"
              {...register('salary_min', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Max salary</label>
            <input
              type="number"
              min={0}
              className="input-field"
              {...register('salary_max', { valueAsNumber: true })}
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Category</label>
            <select className="input-field" {...register('category_id')}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Description *</label>
          <textarea rows={6} className="input-field" {...register('description')} />
          {errors.description && (
            <p className="mt-1 text-[13px] text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Requirements</label>
          <textarea rows={4} className="input-field" {...register('requirements')} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Responsibilities</label>
          <textarea rows={4} className="input-field" {...register('responsibilities')} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Benefits</label>
          <textarea rows={3} className="input-field" {...register('benefits')} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Application deadline</label>
          <input type="date" className="input-field" {...register('deadline')} />
        </div>

        {skills.length > 0 && (
          <div>
            <label className="block text-[13px] font-medium text-ink-700 mb-2">Required skills</label>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-2.5 py-1 rounded-lg text-[13px] transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-surface-100 text-ink-500 hover:bg-surface-200'
                  }`}
                  style={{ boxShadow: selectedSkills.includes(skill.id) ? '0 0 0 1px rgba(124,58,237,0.2)' : 'var(--card-shadow)' }}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-5 border-t border-ink-900/[0.04] dark:border-ink-300/[0.06]">
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="btn-secondary px-5 py-2"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary px-5 py-2">
            {submitting ? <LoadingSpinner size="sm" /> : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
