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
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <SEO title="Login" description="Sign in to your JobBoard account." />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 mb-4"
          >
            <LockClosedIcon className="h-5 w-5 text-white" />
          </motion.div>
          <h1 className="text-heading text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-400">Sign in to your account to continue</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: 'var(--card-shadow-lg)' }}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-5 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-[13px] font-medium"
                style={{ boxShadow: '0 0 0 1px rgba(239,68,68,0.1)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
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
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-[13px] text-red-500"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="password" className="block text-[13px] font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 text-ink-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input-field pl-9 pr-10"
                  {...register('password')}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-300 hover:text-ink-500 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ opacity: 0, rotate: -15 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 15 }}
                        transition={{ duration: 0.15 }}
                      >
                        <EyeSlashIcon className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ opacity: 0, rotate: 15 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -15 }}
                        transition={{ duration: 0.15 }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-[13px] text-red-500"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 flex items-center justify-center"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-6 relative"
          >
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-ink-900/[0.04] dark:border-ink-300/[0.06]"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
              <span className="px-3 bg-card text-ink-300">Or continue with</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex justify-center"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              size="large"
              width="320"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-6 pt-5 text-center border-t border-ink-900/[0.04] dark:border-ink-300/[0.06] space-y-2"
          >
            <p className="text-[13px] text-ink-400">
              <Link to="/password/reset/request" className="font-medium text-ink-800 hover:text-primary-600 transition-colors">
                Forgot password?
              </Link>
            </p>
            <p className="text-[13px] text-ink-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-ink-800 hover:text-primary-600 transition-colors">
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
