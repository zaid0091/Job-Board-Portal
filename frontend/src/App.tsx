import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import AppRoutes from './routes';

function App() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch current user on app load to check authentication status
    // This works with HttpOnly cookies - we don't need to check localStorage
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [user, dispatch]);

  return <AppRoutes />;
}

export default App;
