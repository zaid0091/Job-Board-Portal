import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import SEO from '@/components/SEO';

export default function AboutPage() {
  const { stats } = usePlatformStats();
  return (
    <div>
      <SEO title="About" description="Learn about JobBoard — our mission, values, and the team behind the platform." />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-micro text-primary-600 uppercase tracking-widest">About us</p>
          <h1 className="mt-3 text-display-sm sm:text-display text-ink-900">
            Making hiring human again
          </h1>
          <p className="mt-6 text-body-lg text-ink-400 leading-relaxed">
            JobBoard was founded with a simple belief: the hiring process should be transparent,
            fair, and efficient for everyone involved. We connect exceptional talent with companies
            that genuinely value what they do.
          </p>

          <div className="mt-16 space-y-12">
            <div>
              <h2 className="text-heading text-ink-800">Our mission</h2>
              <p className="mt-3 text-sm text-ink-400 leading-relaxed">
                We're on a mission to eliminate the frustration from job searching and hiring.
                No more sending applications into a black hole. No more guessing where you stand.
                Every application is tracked, every employer is verified, and every candidate
                is treated with respect.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800">What makes us different</h2>
              <ul className="mt-3 space-y-3">
                {[
                  'Full transparency — track every application in real-time',
                  'Verified employers — every company on our platform is vetted',
                  'AI-powered matching — surface the most relevant roles for you',
                  'Privacy first — your data stays yours, always',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-heading text-ink-800">Our numbers</h2>
              <div className="mt-4 grid grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl font-semibold text-ink-800">{stat.value}</div>
                    <div className="text-[11px] text-ink-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-ink-900/[0.06]">
            <Link
              to="/jobs"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Start exploring positions
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
