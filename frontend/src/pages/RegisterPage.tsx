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
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Parallax from '@/components/ui/Parallax';

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
    setValue,
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
    <div className="min-h-screen flex bg-zinc-950 overflow-hidden">
      <SEO title="Register" description="Create your Jobly account and start your career journey or post your first job listing." canonical="/register" />
      
      {/* --- Left Column: Visual Brand --- */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-zinc-950 via-zinc-950 to-primary-950" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
        
        <Parallax offset={-100} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[140px]" />
        <Parallax offset={120} className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

        <Link to="/" className="relative flex items-center gap-2 group z-10">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" />
          <span className="text-2xl font-bold text-white tracking-tighter">Jobly</span>
        </Link>

        <div className="relative z-10">
          <ScrollReveal direction="up">
            <h2 className="text-display text-white font-extrabold tracking-tighter leading-tight">
              Start your <br />
              <span className="text-primary-400">new chapter</span>
            </h2>
            <p className="mt-6 text-xl text-white/50 max-w-md leading-relaxed">
              Join thousands of professionals and top-tier companies finding their match 
              on the most advanced talent ecosystem.
            </p>
          </ScrollReveal>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/20">
            Professional Grade &bull; Human Centered
          </p>
        </div>
      </div>

      {/* --- Right Column: Form --- */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-zinc-950 relative overflow-y-auto">
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-primary-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10 py-8">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/" className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <ArrowLeftIcon className="h-4 w-4 text-ink-900 dark:text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">Create Account</h1>
            </div>
          </ScrollReveal>

          <PremiumCard className="p-8 sm:p-10 border-ink-900/[0.04] dark:border-white/[0.04]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'SEEKER')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedRole === 'SEEKER'
                        ? 'border-primary-500 bg-primary-500/5 text-primary-600'
                        : 'border-zinc-100 dark:border-zinc-800 text-ink-400 hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                    <span className="text-[12px] font-bold uppercase tracking-wider">Find a Job</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'EMPLOYER')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedRole === 'EMPLOYER'
                        ? 'border-primary-500 bg-primary-500/5 text-primary-600'
                        : 'border-zinc-100 dark:border-zinc-800 text-ink-400 hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}
                  >
                    <BuildingOffice2Icon className="h-6 w-6" />
                    <span className="text-[12px] font-bold uppercase tracking-wider">Hire Talent</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="input-field bg-zinc-50 dark:bg-zinc-900/50"
                    {...register('first_name')}
                  />
                  {errors.first_name && <p className="text-[11px] text-red-500 font-medium">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="input-field bg-zinc-50 dark:bg-zinc-900/50"
                    {...register('last_name')}
                  />
                  {errors.last_name && <p className="text-[11px] text-red-500 font-medium">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Username</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="johndoe"
                    className="input-field pl-12 bg-zinc-50 dark:bg-zinc-900/50"
                    {...register('username')}
                  />
                </div>
                {errors.username && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Email Address</label>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field pl-12 bg-zinc-50 dark:bg-zinc-900/50"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Password</label>
                  <div className="relative group">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900/50"
                      {...register('password')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Confirm</label>
                  <div className="relative group">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900/50"
                      {...register('password_confirm')}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex-1">
                  {errors.password && <p className="text-[11px] text-red-500 font-medium leading-tight">{errors.password.message}</p>}
                  {errors.password_confirm && <p className="text-[11px] text-red-500 font-medium leading-tight">{errors.password_confirm.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[12px] font-bold text-ink-400 hover:text-primary-600 transition-colors ml-4"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary-600/20 overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                  </span>
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-[14px] text-ink-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors underline underline-offset-4 decoration-primary-500/30 hover:decoration-primary-500">
                Sign in
              </Link>
            </p>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
