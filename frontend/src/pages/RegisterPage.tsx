import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const registerSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    role: z.enum(['EMPLOYER', 'SEEKER'], { required_error: 'Select a role' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    password_confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'SEEKER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <SEO title="Register" description="Create your JobBoard account and start your career journey." />
      <div className="w-full max-w-sm animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 mb-4">
            <UserPlusIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-heading text-ink-900">Create an account</h1>
          <p className="mt-1.5 text-sm text-ink-400">Get started in under a minute</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 sm:p-8" style={{ boxShadow: 'var(--card-shadow-lg)' }}>
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-[13px] font-medium" style={{ boxShadow: '0 0 0 1px rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-[13px] font-medium text-ink-700 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedRole === 'SEEKER'
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'bg-surface-50 text-ink-400 hover:bg-surface-100'
                  }`}
                  style={{ boxShadow: selectedRole === 'SEEKER' ? '0 0 0 1.5px rgba(124,58,237,0.3)' : 'var(--card-shadow)' }}
                >
                  <input type="radio" value="SEEKER" className="sr-only" {...register('role')} />
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span className="text-[13px] font-semibold">Find a job</span>
                </label>
                <label
                  className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedRole === 'EMPLOYER'
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'bg-surface-50 text-ink-400 hover:bg-surface-100'
                  }`}
                  style={{ boxShadow: selectedRole === 'EMPLOYER' ? '0 0 0 1.5px rgba(124,58,237,0.3)' : 'var(--card-shadow)' }}
                >
                  <input type="radio" value="EMPLOYER" className="sr-only" {...register('role')} />
                  <BuildingOffice2Icon className="h-5 w-5" />
                  <span className="text-[13px] font-semibold">Hire talent</span>
                </label>
              </div>
              {errors.role && <p className="mt-1 text-[13px] text-red-500">{errors.role.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                  First name
                </label>
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  className="input-field"
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="mt-1 text-[13px] text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                  Last name
                </label>
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  className="input-field"
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="mt-1 text-[13px] text-red-500">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[13px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                className="input-field"
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-[13px] text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
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
              <label
                htmlFor="password_confirm"
                className="block text-[13px] font-medium text-ink-700 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="password_confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="input-field"
                {...register('password_confirm')}
              />
              {errors.password_confirm && (
                <p className="mt-1 text-[13px] text-red-500">{errors.password_confirm.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t border-ink-900/[0.04] dark:border-ink-300/[0.06]">
            <p className="text-[13px] text-ink-400">
              Already have an account?{' '}
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
