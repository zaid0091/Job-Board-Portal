import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import AppRoutes from './routes';

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const authPages = ['/login', '/register', '/password/reset/request', '/password/reset/confirm'];
    const isAuthPage = authPages.includes(location.pathname);

    // Always check current user on app load if not authenticated and not on auth pages
    // This ensures auth state is properly initialized from cookies
    if (!isAuthenticated && !isAuthPage) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, location.pathname, dispatch]);

  // Additional effect to handle cases where auth might be stale
  useEffect(() => {
    if (!user && !isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        const authPages = ['/login', '/register', '/password/reset/request', '/password/reset/confirm'];
        const isAuthPage = authPages.includes(location.pathname);
        if (!isAuthPage) {
          dispatch(fetchCurrentUser());
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, isAuthenticated, location.pathname, dispatch]);

  return <AppRoutes />;
}

export default App;
