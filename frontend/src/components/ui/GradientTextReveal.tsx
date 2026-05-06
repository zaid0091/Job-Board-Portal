import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

interface GradientTextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  gradient?: string;
}

export default function GradientTextReveal({
  text,
  className = '',
  as = 'h2',
  gradient = 'from-primary-500 via-violet-500 to-fuchsia-500',
}: GradientTextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const clipPath = useTransform(scrollYProgress, [0, 0.6], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  const Tag = motion[as] as typeof motion.h1;

  return (
    <Tag ref={ref} className={`overflow-hidden ${className}`}>
      <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        <motion.span
          style={{ clipPath, display: 'inline-block' }}
        >
          {text}
        </motion.span>
      </span>
    </Tag>
  );
}
