import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-ink-900/[0.04] dark:border-ink-300/[0.06] mt-auto" style={{ backgroundColor: 'rgb(var(--bg-page))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-12 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-[11px]">JB</span>
              </div>
              <span className="text-[15px] font-semibold text-ink-800">JobBoard</span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-400 max-w-[240px]">
              Connecting exceptional talent with companies that value what they do.
            </p>
          </div>

          <div>
            <h4 className="text-micro text-ink-300 uppercase tracking-widest mb-4">Seekers</h4>
            <ul className="space-y-2.5">
              <li><Link to="/jobs" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Browse positions</Link></li>
              <li><Link to="/register" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Create account</Link></li>
              <li><Link to="/seeker/dashboard" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-micro text-ink-300 uppercase tracking-widest mb-4">Employers</h4>
            <ul className="space-y-2.5">
              <li><Link to="/employer/jobs/create" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Post a position</Link></li>
              <li><Link to="/register" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Create account</Link></li>
              <li><Link to="/employer/dashboard" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-micro text-ink-300 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-[13px] text-ink-500 hover:text-ink-800 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="py-5 border-t border-ink-900/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-ink-300">
            &copy; {new Date().getFullYear()} JobBoard. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-[11px] text-ink-300 hover:text-ink-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[11px] text-ink-300 hover:text-ink-500 transition-colors">Terms</Link>
            <a href="#" className="text-[11px] text-ink-300 hover:text-ink-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
