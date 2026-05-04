import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchEmployerProfile, fetchSeekerProfile } from '@/store/slices/profileSlice';
import { fetchUnreadCount } from '@/store/slices/notificationsSlice';
import { Bars2Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { employerProfile, seekerProfile } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const location = useLocation();

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
      const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
      return () => clearInterval(interval);
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
    // Force redirect to login page after logout
    window.location.href = '/login';
  };

  const isActive = (match: string) => location.pathname.startsWith(match);
  const isHome = location.pathname === '/';
  const onHero = isHome && !pastHero;

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
        (scrolled && !isHome) || pastHero
          ? 'bg-white/60 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-ink-900/[0.06] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            {/* <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs leading-none">JB</span>
            </div> */}
            <span
              className={`text-[17px] font-semibold tracking-tight transition-colors duration-300 ${
                onHero ? 'text-white' : 'text-ink-800'
              }`}
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              JobBoard
            </span>
          </Link>

          {/* Center Nav */}
          <div
            className={`hidden md:flex items-center gap-0.5 rounded-xl p-1 border transition-colors duration-300 ${
              onHero ? 'bg-white/10 border-white/10' : 'bg-surface-50/80 border-ink-900/[0.04]'
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative overflow-hidden px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  onHero
                    ? 'group border-0 text-white hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] hover:scale-[1.05] active:scale-[0.97]'
                    : 'group border-0 text-ink-700 hover:shadow-sm hover:scale-[1.05] active:scale-[0.97]'
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-1.5">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className={`relative p-2 rounded-lg transition-colors ${
                    onHero
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
                      onHero
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-ink-600 hover:text-ink-800 hover:bg-surface-50'
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
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

                  {profileOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-zinc-900 border border-ink-900/[0.07] rounded-xl shadow-lg py-1 z-50">
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
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                    onHero
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
              onHero
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
      {mobileMenuOpen && (
        <div className="md:hidden premium-sidebar-scroll max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-ink-900/[0.06] px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                isActive(link.match)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-ink-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-ink-900/[0.06] mt-1 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
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
          </div>
        </div>
      )}
    </nav>
  );
}