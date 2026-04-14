import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import SEO from '@/components/SEO';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setSending(true);
    setStatus('idle');
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      setStatus('success');
      formRef.current.reset();
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };
  return (
    <div>
      <SEO title="Contact" description="Get in touch with the JobBoard team. We'd love to hear from you." />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-micro text-primary-600 uppercase tracking-widest">Contact</p>
            <h1 className="mt-3 text-display-sm sm:text-display text-ink-900">
              Get in touch
            </h1>
            <p className="mt-4 text-body-lg text-ink-400">
              Have a question, feedback, or partnership inquiry? We'd love to hear from you.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-ink-900/[0.06] bg-card">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-4">
                <EnvelopeIcon className="h-[18px] w-[18px] text-primary-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink-800">Email us</h3>
              <p className="mt-1.5 text-sm text-ink-400">For general inquiries and support</p>
              <a href="mailto:hello@jobboard.com" className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                hello@jobboard.com
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-ink-900/[0.06] bg-card">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-4">
                <MapPinIcon className="h-[18px] w-[18px] text-primary-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink-800">Office</h3>
              <p className="mt-1.5 text-sm text-ink-400">Come say hello at our HQ</p>
              <p className="mt-3 text-sm font-medium text-ink-600">
                San Francisco, CA
              </p>
            </div>
          </div>

          <div className="mt-14">
            <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Name</label>
                  <input type="text" id="contact-name" name="from_name" className="input-field" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Email</label>
                  <input type="email" id="contact-email" name="from_email" className="input-field" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Subject</label>
                <input type="text" id="contact-subject" name="subject" className="input-field" placeholder="How can we help?" required />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Message</label>
                <textarea id="contact-message" name="message" className="input-field min-h-[120px] resize-y" placeholder="Tell us more..." required />
              </div>
              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send message'}
              </button>
              {status === 'success' && (
                <p className="text-sm text-green-600 font-medium">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-sm text-red-600 font-medium">Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
