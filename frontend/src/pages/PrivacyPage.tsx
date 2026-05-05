import SEO from '@/components/SEO';

export default function PrivacyPage() {
  return (
    <div>
      <SEO title="Privacy Policy" description="Read our privacy policy to understand how we handle your data." canonical="/privacy" />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-micro text-primary-600 uppercase tracking-widest">Legal</p>
          <h1 className="mt-3 text-display-sm sm:text-display text-ink-900">Privacy Policy</h1>
          <p className="mt-4 text-sm text-ink-400">Last updated: April 2, 2026</p>

          <div className="mt-12 space-y-10 text-sm text-ink-500 leading-relaxed">
            <div>
              <h2 className="text-heading text-ink-800 mb-3">1. Information we collect</h2>
              <p>
                We collect information you provide directly, including your name, email address,
                resume, and professional details when you create an account. We also collect
                usage data such as pages visited, features used, and interaction patterns to
                improve our platform.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">2. How we use your information</h2>
              <p>Your information is used to:</p>
              <ul className="mt-2 space-y-1.5 list-disc pl-5">
                <li>Provide, maintain, and improve our services</li>
                <li>Match you with relevant job opportunities</li>
                <li>Send notifications about application status updates</li>
                <li>Communicate important service updates</li>
                <li>Analyze platform usage to enhance the experience</li>
              </ul>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">3. Information sharing</h2>
              <p>
                We never sell your personal data. Your resume and profile details are only
                shared with employers when you explicitly apply to their positions. We may
                share anonymized, aggregated data for analytics purposes.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">4. Data security</h2>
              <p>
                We implement industry-standard security measures including encryption in
                transit and at rest, regular security audits, and access controls to protect
                your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">5. Your rights</h2>
              <p>
                You have the right to access, update, or delete your personal information
                at any time through your account settings. You can also request a complete
                export of your data by contacting our support team.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">6. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. Analytics
                cookies are used only with your consent to understand how our platform is used.
              </p>
            </div>

            <div>
              <h2 className="text-heading text-ink-800 mb-3">7. Contact</h2>
              <p>
                For privacy-related questions, contact us at{' '}
                <a href="mailto:privacy@jobboard.com" className="text-primary-600 hover:text-primary-700 transition-colors">
                  privacy@jobboard.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
