import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StickyScrollSectionProps {
  children: ReactNode;
  className?: string;
  pinDuration?: number;
  fromOpacity?: number;
  fromY?: number;
}

export default function StickyScrollSection({
  children,
  className = '',
  pinDuration = 3,
  fromOpacity = 0.3,
  fromY = 40,
}: StickyScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [fromOpacity, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [fromY, 0]);
  const scale = useTransform(scrollYProgress, [0.7, 1], [1, 0.95]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height: `${pinDuration * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div ref={contentRef} style={{ opacity, y, scale }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
