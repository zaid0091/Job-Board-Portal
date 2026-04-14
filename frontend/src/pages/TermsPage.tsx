import SEO from '@/components/SEO';

export default function TermsPage() {
  return (
    <div>
      <SEO title="Terms of Service" description="Review the terms and conditions for using JobBoard." />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-micro text-primary-600 uppercase tracking-widest">Legal</p>
          <h1 className="mt-3 text-display-sm sm:text-display text-ink-900">Terms of Service</h1>
          <p className="mt-4 text-sm text-ink-400">Last updated: April 2, 2026</p>

          <div className="mt-12 space-y-10 text-sm text-ink-500 leading-relaxed">
            <div>
              <h2 className="text-heading text-ink-800 mb-3">1. Acceptance of terms</h2>
              <p>
                By accessing or using JobBoard, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">2. Account registration</h2>
              <p>
                You must provide accurate and complete information when creating an account.
                You are responsible for maintaining the security of your account credentials
                and for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">3. Acceptable use</h2>
              <p>You agree not to:</p>
              <ul className="mt-2 space-y-1.5 list-disc pl-5">
                <li>Post false, misleading, or fraudulent job listings</li>
                <li>Misrepresent your qualifications or identity</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Attempt to access other users' accounts or data</li>
                <li>Scrape, crawl, or use automated tools to extract data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">4. Job listings</h2>
              <p>
                Employers are responsible for the accuracy of their job postings. JobBoard
                reserves the right to remove listings that violate our guidelines or appear
                fraudulent. All positions must comply with applicable employment laws.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">5. Intellectual property</h2>
              <p>
                The JobBoard platform, including its design, features, and content, is
                protected by intellectual property laws. You retain ownership of content
                you submit, but grant us a license to display and process it for providing
                our services.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">6. Limitation of liability</h2>
              <p>
                JobBoard is provided "as is" without warranties of any kind. We are not
                responsible for employment decisions made through the platform or the
                accuracy of information provided by users.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">7. Termination</h2>
              <p>
                We may suspend or terminate your account at our discretion if you violate
                these terms. You may delete your account at any time through your account
                settings.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">8. Contact</h2>
              <p>
                For questions about these terms, contact us at{' '}
                <a href="mailto:legal@jobboard.com" className="text-primary-600 hover:text-primary-700 transition-colors">
                  legal@jobboard.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
