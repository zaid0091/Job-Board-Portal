import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface LineRevealProps {
  className?: string;
  delay?: number;
  duration?: number;
  fromLeft?: boolean;
}

export default function LineReveal({
  className = '',
  delay = 0,
  duration = 1,
  fromLeft = true,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={`h-[1px] w-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"
        initial={{ scaleX: 0, transformOrigin: fromLeft ? 'left' : 'right' }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  );
}
