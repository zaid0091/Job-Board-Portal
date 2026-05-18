import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser, logout } from '@/store/slices/authSlice';
import { useWebSocket } from '@/hooks/useWebSocket';
import AppRoutes from './routes';
import Lenis from 'lenis';
// import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [authInitialized, setAuthInitialized] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useWebSocket();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Scroll to top on refresh
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Let the chat room use its own scroll container (no Lenis hijacking)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (location.pathname.startsWith('/messages')) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [location.pathname]);

  useEffect(() => {
    const authPages = ['/login', '/register', '/password/reset/request', '/password/reset/confirm'];
    const isAuthPage = authPages.includes(location.pathname);

    if (isAuthenticated || isAuthPage) {
      setAuthInitialized(true);
      return;
    }

    let cancelled = false;

    const initializeAuth = async () => {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch {
        dispatch(logout());
      } finally {
        if (!cancelled) {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, location.pathname]);

  return <AppRoutes authInitialized={authInitialized} />;
}

export default App;
