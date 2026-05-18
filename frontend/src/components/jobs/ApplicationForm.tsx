import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { applicationsAPI } from '@/api';
import { DocumentArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline';

const applicationSchema = z.object({
  cover_letter: z.string().optional(),
  expected_salary: z.number().optional(),
  available_from: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({ jobId, onSuccess, onCancel }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const draftIdRef = useRef<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { cover_letter: '' },
  });

  const coverLetterValue = watch('cover_letter');

  const loadDraft = useCallback(async (regenerate = false) => {
    if (regenerate) {
      setRegenerating(true);
    } else {
      setLoadingDraft(true);
    }
    setDraftError(null);
    try {
      const preview = await applicationsAPI.previewCoverLetter(jobId, regenerate);
      setValue('cover_letter', preview.cover_letter);
      setHighlights(preview.highlights ?? []);
      setDisclaimer(preview.disclaimer);
      draftIdRef.current = preview.draft_id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Could not generate a cover letter draft.';
      setDraftError(message);
      draftIdRef.current = null;
    } finally {
      setLoadingDraft(false);
      setRegenerating(false);
    }
  }, [jobId, setValue]);

  useEffect(() => {
    loadDraft(false);
  }, [loadDraft]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
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

  const handleClearCoverLetter = () => {
    setValue('cover_letter', '');
    draftIdRef.current = null;
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('job', jobId);
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
      if (draftIdRef.current) {
        formData.append('cover_letter_draft_id', draftIdRef.current);
      }
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
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-[13px] font-semibold text-ink-700">Cover Letter</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadDraft(true)}
                disabled={loadingDraft || regenerating}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
              <button
                type="button"
                onClick={handleClearCoverLetter}
                disabled={loadingDraft || !coverLetterValue}
                className="text-[12px] font-medium text-ink-500 hover:text-ink-700 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          {loadingDraft && (
            <div className="input-field min-h-[160px] animate-pulse bg-surface-100 dark:bg-surface-800 rounded-xl" />
          )}

          {!loadingDraft && draftError && (
            <p className="text-xs text-amber-600 dark:text-amber-400">{draftError}</p>
          )}

          {!loadingDraft && (
            <textarea
              rows={8}
              className="input-field min-h-[160px] resize-none"
              placeholder="Introduce yourself and explain why you're a perfect match for this role..."
              {...register('cover_letter')}
            />
          )}

          {errors.cover_letter && (
            <p className="mt-1 text-xs text-red-500">{errors.cover_letter.message}</p>
          )}

          {disclaimer && !loadingDraft && (
            <p className="text-[11px] text-ink-400">{disclaimer}</p>
          )}

          {highlights.length > 0 && !loadingDraft && (
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHighlights((v) => !v)}
                className="w-full px-3 py-2 text-left text-[12px] font-semibold text-ink-600 bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100"
              >
                Suggested highlights {showHighlights ? '▾' : '▸'}
              </button>
              {showHighlights && (
                <ul className="px-3 py-2 space-y-1.5 text-[12px] text-ink-600 list-disc list-inside">
                  {highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[13px] font-semibold text-ink-700">Resume (optional)</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                <DocumentArrowUpIcon className="h-5 w-5 text-ink-400 group-hover:text-primary-600" />
              </div>
              {resumeFile ? (
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-primary-600">{resumeFile.name}</p>
                  <p className="text-[11px] text-ink-400">Click or drag to replace</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[13px] text-ink-700 font-medium">
                    {isDragActive ? 'Drop it here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-[11px] text-ink-400">PDF, DOC, DOCX up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-ink-700">Expected Salary (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">$</span>
              <input
                type="number"
                className="input-field pl-7"
                placeholder="80,000"
                {...register('expected_salary', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-ink-700">Available From</label>
            <input type="date" className="input-field" {...register('available_from')} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-surface-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-ink-600 hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingDraft}
            className="flex-[2] btn-primary py-2.5 shadow-sm shadow-primary-500/20 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
