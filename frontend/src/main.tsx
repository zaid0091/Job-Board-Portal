import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { store } from './store';
import { injectStore } from './api/axiosInstance';
import { ThemeProvider } from './hooks/useTheme';
import './index.css';

// Break circular dependency: store -> slices -> api -> axiosInstance -> store
injectStore(store);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
);
