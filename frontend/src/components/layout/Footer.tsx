import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-ink-900/[0.04] dark:border-ink-300/[0.06] mt-auto" style={{ backgroundColor: 'rgb(var(--bg-page))' }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Huge Logo Hero */}
        <div className="pt-24 pb-12 flex justify-center border-b border-ink-900/[0.04] dark:border-ink-300/[0.06] mb-12 px-2 overflow-hidden">
          <Logo size="huge" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link className="flex items-center gap-1 flex-shrink-0 group mb-3" to="/">
              <div className="relative">
                <img src="/logo.png" alt="Jobly" className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                <div className="absolute inset-0 bg-primary-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="h-8 w-[2px] mx-2 transition-colors duration-300 bg-ink-900/30"></div>
              <span className="text-2xl font-courier tracking-normal transition-colors duration-300 text-ink-900">Jobly</span>
            </Link>
            <p className="text-[14px] leading-relaxed text-ink-400 max-w-[240px]">
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

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-5 border-t border-ink-900/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-ink-300">
              &copy; {new Date().getFullYear()} Jobly. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link to="/privacy" className="text-[11px] text-ink-300 hover:text-ink-800 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-[11px] text-ink-300 hover:text-ink-800 transition-colors">Terms</Link>
              <a href="#" className="text-[11px] text-ink-300 hover:text-ink-800 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
