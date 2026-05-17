import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, googleLoginUser } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Parallax from '@/components/ui/Parallax';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Successfully logged in!');
      navigate('/');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const result = await dispatch(googleLoginUser(credentialResponse.credential));
      if (googleLoginUser.fulfilled.match(result)) {
        toast.success('Successfully logged in with Google!');
        navigate('/');
      }
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 overflow-hidden">
      <SEO title="Login" description="Sign in to your Jobly account to apply for jobs or manage your listings." canonical="/login" />
      
      {/* --- Left Column: Visual Brand --- */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
        
        <Parallax offset={100} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[140px]" />
        <Parallax offset={-80} className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />

        <Link to="/" className="relative flex items-center gap-2 group z-10">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" />
          <span className="text-2xl font-bold text-white tracking-tighter">Jobly</span>
        </Link>

        <div className="relative z-10">
          <ScrollReveal direction="up">
            <h2 className="text-display text-white font-extrabold tracking-tighter leading-tight">
              Unlock your <br />
              <span className="text-primary-400">professional potential</span>
            </h2>
            <p className="mt-6 text-xl text-white/50 max-w-md leading-relaxed">
              Connect with high-growth companies and manage your career journey with 
              next-generation hiring tools.
            </p>
          </ScrollReveal>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/20">
            Est. 2024 &bull; Global Career Network
          </p>
        </div>
      </div>

      {/* --- Right Column: Form --- */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-zinc-950 relative">
        {/* Background mesh for mobile */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-primary-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-4 mb-12">
              <Link to="/" className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <ArrowLeftIcon className="h-4 w-4 text-ink-900 dark:text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">Sign In</h1>
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
                {errors.email && <p className="text-[12px] text-red-500 font-medium pl-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Password</label>
                  <Link to="/password/reset/request" className="text-[12px] font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-12 bg-zinc-50 dark:bg-zinc-900/50"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-red-500 font-medium pl-1">{errors.password.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary-600/20 overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-ink-900/[0.05] dark:border-white/[0.05]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="px-4 bg-white dark:bg-zinc-900 text-ink-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>

            <p className="mt-10 text-center text-[14px] text-ink-400">
              New to Jobly?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors underline underline-offset-4 decoration-primary-500/30 hover:decoration-primary-500">
                Create an account
              </Link>
            </p>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
