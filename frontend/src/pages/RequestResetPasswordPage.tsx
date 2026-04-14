import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import { EnvelopeIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const requestResetSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;

export default function RequestResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  });

  const onSubmit = async (data: RequestResetFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
        <SEO title="Email Sent" description="Password reset email sent." />
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-heading text-ink-900 mb-2">Check your email</h1>
          <p className="text-sm text-ink-500 mb-8">
            We&apos;ve sent a password reset link to your email address. The link will expire in 1 hour.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <SEO title="Reset Password" description="Reset your JobBoard account password." />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 mb-4">
            <LockClosedIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-heading text-ink-900">Forgot password?</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 sm:p-8" style={{ boxShadow: 'var(--card-shadow-lg)' }}>
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-[13px] font-medium" style={{ boxShadow: '0 0 0 1px rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 text-ink-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[13px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t border-ink-900/[0.04] dark:border-ink-300/[0.06]">
            <p className="text-[13px] text-ink-400">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-ink-800 hover:text-primary-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
