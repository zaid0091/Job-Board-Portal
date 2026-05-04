import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%" | "auto";
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
}

/**
 * A premium scroll-reveal component powered by Framer Motion.
 * Features buttery smooth transitions and easy direction controls.
 */
export default function ScrollReveal({
  children,
  width = "auto",
  className,
  delay = 0,
  direction = "up",
  duration = 0.8,
  distance = 30,
  once = true,
  threshold = 0.1,
}: ScrollRevealProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      className={className}
      style={{ width, position: 'relative' }}
      initial={{ 
        opacity: 0, 
        ...(direction !== 'none' ? directions[direction] : {}) 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once, amount: threshold }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Buttery smooth ease-out
      }}
    >
      {children}
    </motion.div>
  );
}
