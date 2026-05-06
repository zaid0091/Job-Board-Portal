import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface ScrollScaleProps {
  children: ReactNode;
  className?: string;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  fromRotate?: number;
  toRotate?: number;
  once?: boolean;
  threshold?: number;
  /** Accepted for API compatibility; scroll animations are position-driven. */
  duration?: number;
}

export default function ScrollScale({
  children,
  className = '',
  fromScale = 0.85,
  toScale = 1,
  fromOpacity = 0,
  toOpacity = 1,
  fromRotate = 4,
  toRotate = 0,
  once = true,
  threshold = 0.2,
}: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-80px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [fromScale, toScale]);
  const opacity = useTransform(scrollYProgress, [0, 1], [fromOpacity, toOpacity]);
  const rotate = useTransform(scrollYProgress, [0, 1], [fromRotate, toRotate]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        scale: isInView ? scale : fromScale,
        opacity: isInView ? opacity : fromOpacity,
        rotate: isInView ? rotate : fromRotate,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </motion.div>
  );
}
