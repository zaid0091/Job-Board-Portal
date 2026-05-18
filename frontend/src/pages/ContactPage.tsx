import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { EnvelopeIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ScrollScale from '@/components/ui/ScrollScale';
import PremiumCard from '@/components/ui/PremiumCard';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import LineReveal from '@/components/ui/LineReveal';

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
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <SEO 
        title="Contact Us" 
        description="Get in touch with the Jobly team. We'd love to hear from you regarding partnerships, support, or feedback." 
        canonical="/contact" 
      />

      {/* --- Hero Section (same shell as About) --- */}
      <HeroGeometric
        className="min-h-0 pt-32 pb-20 sm:pt-48 sm:pb-32 -mt-14 [mask-image:linear-gradient(to_bottom,black_calc(100%-80px),transparent_100%)]"
        contentClassName="px-4 sm:px-6"
      >
        <div className="relative max-w-5xl mx-auto text-center">
          <ScrollReveal direction="up" duration={1} distance={20}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50/80 border border-primary-200/60 backdrop-blur-sm mb-8 dark:bg-white/[0.06] dark:border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary-700 dark:text-white/60">Connect</span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2} duration={1}>
            <h1 className="text-display-sm sm:text-display lg:text-display-lg text-ink-900 dark:text-white max-w-4xl mx-auto leading-[1.1] font-extrabold tracking-tighter">
              Let&apos;s build the future <br />
              <span className="text-primary-600 dark:text-primary-400">of hiring together</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} duration={1}>
            <p className="mt-8 text-body-lg text-ink-600 dark:text-white/50 max-w-2xl mx-auto leading-relaxed">
              Have a question, feedback, or partnership inquiry? Reach out and we&apos;ll
              get back to you within 24 hours.
            </p>
          </ScrollReveal>
        </div>
      </HeroGeometric>

      {/* --- Contact Info Grid --- */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: EnvelopeIcon, 
                title: 'Email Us', 
                desc: 'Support & general inquiries', 
                action: 'hello@jobly.co', 
                href: 'mailto:hello@jobly.co' 
              },
              { 
                icon: ChatBubbleLeftRightIcon, 
                title: 'Partnerships', 
                desc: 'Collaborate with us', 
                action: 'partners@jobly.co', 
                href: 'mailto:partners@jobly.co' 
              },
              { 
                icon: MapPinIcon, 
                title: 'Visit HQ', 
                desc: 'Come say hello', 
                action: 'San Francisco, CA', 
                href: '#' 
              },
            ].map((item, i) => (
              <ScrollScale key={item.title} delay={i * 0.1}>
                <PremiumCard className="p-8 group h-full">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-ink-400 mb-6 leading-relaxed">{item.desc}</p>
                  <a 
                    href={item.href} 
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1.5"
                  >
                    {item.action}
                  </a>
                </PremiumCard>
              </ScrollScale>
            ))}
          </div>

          <div className="mt-24 sm:mt-32">
            <LineReveal className="bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          </div>

          {/* --- Form Section --- */}
          <div className="mt-24 sm:mt-32 grid lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2">
              <ScrollReveal direction="left">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                  Message Us
                </div>
                <h2 className="text-display-sm text-ink-900 dark:text-white font-bold tracking-tight mb-6">
                  Send us a direct <br /> message
                </h2>
                <p className="text-body-lg text-ink-400 leading-relaxed mb-8">
                  Fill out the form and our team will get back to you as soon as possible. 
                  We typically respond within one business day.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-ink-600 dark:text-ink-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Verified Partnership Inquiries
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-600 dark:text-ink-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    24/7 Priority Support for Enterprise
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-3">
              <ScrollReveal direction="right">
                <PremiumCard className="p-8 sm:p-10">
                  <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Your Name</label>
                        <input type="text" name="from_name" className="input-field" placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Email Address</label>
                        <input type="email" name="from_email" className="input-field" placeholder="john@example.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Subject</label>
                      <input type="text" name="subject" className="input-field" placeholder="Partnership inquiry" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-ink-700 dark:text-ink-300">Message</label>
                      <textarea name="message" className="input-field min-h-[160px] resize-none" placeholder="Tell us more about your inquiry..." required />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        className="group relative w-full sm:w-auto px-12 py-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary-600/20 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        disabled={sending}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        
                        <span className="relative flex items-center justify-center gap-2">
                          {sending ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            'Send Message'
                          )}
                        </span>
                      </button>
                    </div>

                    {status === 'success' && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-600 font-medium bg-green-50 dark:bg-green-900/20 p-4 rounded-xl"
                      >
                        Message sent successfully! We'll be in touch soon.
                      </motion.p>
                    )}
                    {status === 'error' && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl"
                      >
                        Something went wrong. Please try again or email us directly.
                      </motion.p>
                    )}
                  </form>
                </PremiumCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle footer credit */}
      <section className="pb-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-300 dark:text-white/20">
          Est. 2024 &bull; Jobly Ecosystem
        </p>
      </section>
    </div>
  );
}
