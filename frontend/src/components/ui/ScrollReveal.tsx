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
  duration = 1,
  distance = 40,
  once = true,
  threshold = 0.1,
}: ScrollRevealProps) {
  const directions = {
    up: { y: distance, rotateX: 10 },
    down: { y: -distance, rotateX: -10 },
    left: { x: distance, rotateY: -10 },
    right: { x: -distance, rotateY: 10 },
    none: {},
  };

  return (
    <div style={{ perspective: "1200px" }}>
      <motion.div
        className={className}
        style={{ width, position: 'relative', transformStyle: "preserve-3d" }}
        initial={{ 
          opacity: 0, 
          scale: 0.95,
          ...(direction !== 'none' ? directions[direction] : {}) 
        }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          x: 0, 
          y: 0,
          rotateX: 0,
          rotateY: 0
        }}
        viewport={{ once, amount: threshold }}
        transition={{ 
          duration: duration, 
          delay: delay,
          ease: [0.16, 1, 0.3, 1], // Advanced exponential ease-out
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
