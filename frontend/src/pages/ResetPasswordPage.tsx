import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const resetPasswordSchema = z.object({
  password: z.string().min(10, 'Password must be at least 10 characters'),
  password_confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsInvalid(true);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.resetPassword(token, data.password, data.password_confirm);
      setIsSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInvalid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
        <SEO title="Invalid Link" description="Password reset link is invalid." />
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-heading text-ink-900 mb-2">Invalid reset link</h1>
          <p className="text-sm text-ink-500 mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/password/reset/request" className="btn-primary inline-flex items-center gap-2">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
        <SEO title="Password Reset" description="Your password has been reset." />
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-heading text-ink-900 mb-2">Password reset complete</h1>
          <p className="text-sm text-ink-500 mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <SEO title="Set New Password" description="Set your new JobBoard password." />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 mb-4">
            <LockClosedIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-heading text-ink-900">Set new password</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Enter your new password below
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
              <label htmlFor="password" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 text-ink-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 10 characters"
                  className="input-field pl-9 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-300 hover:text-ink-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[13px] text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 text-ink-300" />
                </div>
                <input
                  id="password_confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="input-field pl-9 pr-10"
                  {...register('password_confirm')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-300 hover:text-ink-500 transition-colors"
                >
                  {showConfirm ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="mt-1 text-[13px] text-red-500">{errors.password_confirm.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
