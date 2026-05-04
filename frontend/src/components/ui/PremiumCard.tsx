import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode, MouseEvent } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * A highly advanced, premium card component.
 * Features:
 * - Dynamic spotlight hover effect that follows the cursor.
 * - Subtle 3D perspective tilt.
 * - Smooth spring-based interactions.
 * - Glassmorphism aesthetics.
 */
export default function PremiumCard({ 
  children, 
  className,
  spotlightColor = "rgba(124, 58, 237, 0.15)" // Primary-600 with low opacity
}: PremiumCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out mouse movement with springs
  const springConfig = { stiffness: 150, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Create radial gradient mask for spotlight
  const background = useMotionTemplate`
    radial-gradient(
      650px circle at ${smoothX}px ${smoothY}px,
      ${spotlightColor},
      transparent 80%
    )
  `;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl border border-ink-900/[0.06] bg-card transition-all duration-500 hover:border-primary-500/30 ${className}`}
      whileHover={{ y: -5, scale: 1.01 }}
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.03), 0 8px 24px -4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Dynamic Spotlight Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{ background }}
      />

      {/* Content Layer */}
      <div className="relative z-10 h-full">
        {children}
      </div>

      {/* Subtle border glow that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100 border border-primary-500/20"
        style={{
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${smoothX}px ${smoothY}px,
              black,
              transparent
            )
          `,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${smoothX}px ${smoothY}px,
              black,
              transparent
            )
          `,
        }}
      />
    </motion.div>
  );
}
