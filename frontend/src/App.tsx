import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import AppRoutes from './routes';

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const authPages = ['/login', '/register', '/password/reset/request', '/password/reset/confirm'];
    const isAuthPage = authPages.includes(location.pathname);

    // Initialize auth state on app load
    const initializeAuth = async () => {
      if (!isAuthenticated && !isAuthPage) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // User is not authenticated, that's okay
          console.log('User not authenticated:', error);
        }
      }
      setAuthInitialized(true);
    };

    initializeAuth();
  }, [dispatch]); // Only run once on mount

  return <AppRoutes authInitialized={authInitialized} />;
}

export default App;
