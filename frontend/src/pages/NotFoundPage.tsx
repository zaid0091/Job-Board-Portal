import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SEO title="Page Not Found" />
      <div className="text-center">
        <p className="text-8xl sm:text-9xl font-extrabold text-primary-200 tracking-tight">404</p>
        <h1 className="mt-2 text-display-sm text-ink-900">Page not found</h1>
        <p className="mt-3 text-[13px] text-ink-500 max-w-sm mx-auto">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary px-6 py-2.5 text-[13px]">
            Go Home
          </Link>
          <Link to="/jobs" className="btn-secondary px-6 py-2.5 text-[13px]">
            Browse Positions
          </Link>
        </div>
      </div>
    </div>
  );
}
