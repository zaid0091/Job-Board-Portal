import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchEmployerProfile, fetchSeekerProfile } from '@/store/slices/profileSlice';
import { fetchUnreadCount } from '@/store/slices/notificationsSlice';
import { fetchChatUnreadCount } from '@/store/slices/chatSlice';
import { Bars2Icon, XMarkIcon, BellIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
// import Logo from '@/components/ui/Logo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { employerProfile, seekerProfile } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { theme } = useTheme();

  const avatarUrl = user?.role === 'EMPLOYER' 
    ? employerProfile?.company_logo 
    : seekerProfile?.avatar;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SEEKER' && !seekerProfile) {
        dispatch(fetchSeekerProfile());
      } else if (user.role === 'EMPLOYER' && !employerProfile) {
        dispatch(fetchEmployerProfile());
      }
    }
  }, [isAuthenticated, user, dispatch, seekerProfile, employerProfile]);

  const { unreadCount } = useAppSelector((state) => state.notifications);
  const chatUnreadCount = useAppSelector((state) => state.chat.unreadCount);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      dispatch(fetchChatUnreadCount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = () => setProfileOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.href = '/';
  };

  const isActive = (match: string) => location.pathname.startsWith(match);
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isContact = location.pathname === '/contact';
  const hasTransparentHero = isHome || isAbout || isContact;
  const onHero = hasTransparentHero && !pastHero;
  /** Light geometric heroes (About/Contact): ink nav. Dark heroes: white overlay nav. */
  const onLightHero = onHero && (isAbout || isContact) && theme === 'light';
  const onHeroOverlay = onHero && !onLightHero;
  /** Transparent at top on light heroes; frosted blur after scroll. */
  const lightHeroFrostedBar = onLightHero && scrolled;
  const showNavBackground =
    (scrolled && !hasTransparentHero) ||
    pastHero ||
    lightHeroFrostedBar;

  const navLinks = [
    { to: '/jobs', label: 'Jobs', match: '/jobs' },
    { to: '/about', label: 'About', match: '/about' },
    { to: '/contact', label: 'Contact', match: '/contact' },
    ...(isAuthenticated && user?.role === 'EMPLOYER'
      ? [{ to: '/employer/dashboard', label: 'Dashboard', match: '/employer' }]
      : []),
      ...(isAuthenticated && user?.role === 'SEEKER'
        ? [
            { to: '/seeker/dashboard', label: 'Dashboard', match: '/seeker/dashboard' },
            { to: '/seeker/applications', label: 'Applications', match: '/seeker/applications' },
            { to: '/seeker/saved-jobs', label: 'Saved Jobs', match: '/seeker/saved-jobs' },
          ]
        : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showNavBackground
          ? 'bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-ink-900/[0.06] dark:border-ink-300/[0.06] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 flex-shrink-0 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Jobly" 
                className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
              />
              <div className="absolute inset-0 bg-primary-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className={`h-8 w-[2px] mx-2 transition-colors duration-300 ${onHeroOverlay ? 'bg-white' : 'bg-ink-900/30 dark:bg-white/30'}`} />
            <span
              className={`text-2xl font-courier tracking-normal transition-colors duration-300 ${
                onHeroOverlay ? 'text-white' : 'text-ink-900 dark:text-white'
              }`}
            >
              Jobly
            </span>
          </Link>

          {/* Center Nav */}
          <div
            className={`hidden md:flex items-center gap-0.5 rounded-xl p-1 border transition-colors duration-300 ${
              onHeroOverlay ? 'bg-white/10 border-white/10' : 'bg-surface-50/80 border-ink-900/[0.04] dark:bg-zinc-900/50 dark:border-white/[0.08]'
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative overflow-hidden px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  onHeroOverlay
                    ? 'group border-0 text-white hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] hover:scale-[1.05] active:scale-[0.97]'
                    : 'group border-0 text-ink-700 dark:text-zinc-200 hover:shadow-sm hover:scale-[1.05] active:scale-[0.97]'
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-1.5">
            <ThemeToggle onHero={onHeroOverlay} />

            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className={`relative p-2 rounded-lg transition-colors ${
                    onHeroOverlay
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-ink-400 hover:text-ink-600 hover:bg-surface-50'
                  }`}
                  aria-label="Messages"
                >
                  <ChatBubbleLeftRightIcon className="h-[18px] w-[18px]" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                  )}
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className={`relative p-2 rounded-lg transition-colors ${
                    onHeroOverlay
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-ink-400 hover:text-ink-600 hover:bg-surface-50'
                  }`}
                >
                  <BellIcon className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                      onHeroOverlay
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-ink-600 hover:text-ink-800 hover:bg-surface-50'
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        loading="lazy"
                        className="h-6 w-6 rounded-full object-cover ring-1 ring-ink-900/10"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-[11px] font-semibold">
                        {user?.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-zinc-900 border border-ink-900/[0.07] rounded-xl shadow-lg py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-ink-900/[0.06]">
                        <p className="text-[11px] text-ink-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={user?.role === 'EMPLOYER' ? '/employer/profile' : '/seeker/profile'}
                        className="block px-3 py-2 text-[13px] text-ink-700 hover:bg-surface-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                    onHeroOverlay
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-ink-600 hover:text-ink-800 hover:bg-surface-50'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-[13px] font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              onHeroOverlay
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-ink-500 hover:text-ink-700 hover:bg-surface-50'
            }`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars2Icon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden premium-sidebar-scroll overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-ink-900/[0.06] px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="py-3 flex flex-col gap-1"
          >
          {navLinks.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.08 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={link.to}
                className={`block px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive(link.match)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.15 + navLinks.length * 0.04 }}
            className="border-t border-ink-900/[0.06] mt-1 pt-2 flex flex-col gap-1"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Messages
                  {chatUnreadCount > 0 && (
                    <span className="ml-auto text-[11px] bg-primary-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {chatUnreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <BellIcon className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto text-[11px] bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={user?.role === 'EMPLOYER' ? '/employer/profile' : '/seeker/profile'}
                  className="px-3 py-2 rounded-lg text-[14px] text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-lg text-[14px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-[14px] text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg text-[14px] font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors text-center"
                >
                  Get started
                </Link>
              </>
            )}
          </motion.div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}