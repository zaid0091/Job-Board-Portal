import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Warns before in-app navigation and browser close when there are unsaved changes.
 * Works with <BrowserRouter> (no data router required).
 */
export default function useUnsavedChanges(isDirty: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const [blockedPath, setBlockedPath] = useState<string | null>(null);
  const bypassing = useRef(false);

  // Browser close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Intercept in-app link clicks
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: MouseEvent) => {
      if (bypassing.current) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (href === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setBlockedPath(href);
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isDirty, location.pathname]);

  // Intercept browser back/forward
  useEffect(() => {
    if (!isDirty) return;

    const handler = () => {
      if (bypassing.current) return;
      // Push current path back so the user stays on the page
      window.history.pushState(null, '', location.pathname);
      setBlockedPath('__back__');
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isDirty, location.pathname]);

  const proceed = useCallback(() => {
    setBlockedPath(null);
    bypassing.current = true;
    navigate(-1);
    // Reset bypass after navigation completes
    setTimeout(() => { bypassing.current = false; }, 100);
  }, [navigate]);

  const reset = useCallback(() => {
    setBlockedPath(null);
  }, []);

  return {
    isBlocked: blockedPath !== null,
    proceed,
    reset,
  };
}
