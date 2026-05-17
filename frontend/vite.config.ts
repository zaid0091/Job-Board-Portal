import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** Pre-bundle app deps to avoid 504 Outdated Optimize Dep after installs or config changes. */
const optimizeDepsInclude = [
  'react',
  'react-dom',
  'react/jsx-dev-runtime',
  'react-router-dom',
  'react-redux',
  '@reduxjs/toolkit',
  'framer-motion',
  'date-fns',
  'react-hook-form',
  '@hookform/resolvers/zod',
  'zod',
  'axios',
  'react-hot-toast',
  'react-helmet-async',
  'react-dropzone',
  'dompurify',
  'clsx',
  'tailwind-merge',
  'lucide-react',
  'lenis',
  '@heroicons/react/24/outline',
  '@heroicons/react/24/solid',
  '@heroicons/react/20/solid',
  '@react-oauth/google',
];

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: optimizeDepsInclude,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/ws': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
