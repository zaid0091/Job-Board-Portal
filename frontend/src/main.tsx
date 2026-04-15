import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { store } from './store';
import { injectStore } from './api/axiosInstance';
import { ThemeProvider } from './hooks/useTheme';
import './index.css';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '471380820430-t1svgevqrt7ndl0r7hncad8f8d2k30r1.apps.googleusercontent.com';

// Break circular dependency: store -> slices -> api -> axiosInstance -> store
injectStore(store);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <HelmetProvider>
      <ThemeProvider>
        <Provider store={store}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </HelmetProvider>
  </GoogleOAuthProvider>,
);
