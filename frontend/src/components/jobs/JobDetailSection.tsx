import { ReactNode } from 'react';
import PremiumCard from '@/components/ui/PremiumCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionBadge from '@/components/ui/SectionBadge';

type JobDetailSectionProps = {
  label: string;
  children: ReactNode;
  delay?: number;
};

export default function JobDetailSection({ label, children, delay = 0 }: JobDetailSectionProps) {
  return (
    <ScrollReveal direction="up" delay={delay} duration={0.7} distance={16}>
      <PremiumCard className="overflow-hidden">
        <div className="p-6 sm:p-8">
          <SectionBadge label={label} className="mb-5" />
          {children}
        </div>
      </PremiumCard>
    </ScrollReveal>
  );
}
