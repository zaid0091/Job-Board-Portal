import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { applicationsAPI } from '@/api';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const applicationSchema = z.object({
  cover_letter: z.string().optional(),
  expected_salary: z.number().optional(),
  available_from: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({ jobId, jobTitle, onSuccess, onCancel }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setResumeFile(accepted[0]);
      }
    },
    onDropRejected: () => {
      toast.error('Invalid file. Please upload a PDF or DOC file under 5MB.');
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('job', jobId);
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
      if (data.expected_salary) formData.append('expected_salary', data.expected_salary.toString());
      if (data.available_from) formData.append('available_from', data.available_from);
      if (resumeFile) formData.append('resume', resumeFile);

      await applicationsAPI.createApplication(formData);
      toast.success('Application submitted successfully!');
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: Record<string, string[]> } };
      const errorData = err.response?.data;
      if (errorData) {
        const messages = Object.values(errorData).flat();
        toast.error(messages[0] || 'Failed to submit application');
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
      <h2 className="text-[15px] font-semibold text-ink-900 mb-4">
        Apply to: {jobTitle}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cover Letter */}
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Cover Letter</label>
          <textarea
            rows={6}
            className="input-field"
            placeholder="Tell the employer why you're a great fit for this role..."
            {...register('cover_letter')}
          />
          {errors.cover_letter && (
            <p className="mt-1 text-sm text-red-500">{errors.cover_letter.message}</p>
          )}
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Resume (optional)</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-950/30' : 'border-ink-900/[0.08] hover:border-ink-900/[0.15]'
            }`}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="h-6 w-6 mx-auto text-ink-400 mb-2" />
            {resumeFile ? (
              <p className="text-[13px] text-ink-700">{resumeFile.name}</p>
            ) : (
              <p className="text-[13px] text-ink-500">
                Drag & drop your resume, or click to select (PDF, DOC, DOCX - max 5MB)
              </p>
            )}
          </div>
        </div>

        {/* Expected Salary */}
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Expected Salary (USD)</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g., 80000"
            {...register('expected_salary', { valueAsNumber: true })}
          />
        </div>

        {/* Available From */}
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Available From</label>
          <input
            type="date"
            className="input-field"
            {...register('available_from')}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
