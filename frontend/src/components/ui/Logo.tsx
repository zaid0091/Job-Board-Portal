import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'huge';
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', light = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to the container
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Ultra-smooth spring settings
  const springX = useSpring(mouseX, { stiffness: 45, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    huge: 'text-[15vw] sm:text-[18vw] md:text-[22vw] leading-none tracking-[-0.01em]'
  };

  // Enhanced radial gradient with larger radius and softer falloff
  const maskImage = useTransform(
    [springX, springY],
    ([x, y]) => {
      const radius = size === 'huge' ? '450px' : '150px';
      return `radial-gradient(circle ${radius} at ${x}px ${y}px, black 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 50%, transparent 80%)`;
    }
  );

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none overflow-hidden group ${size === 'huge' ? 'w-full text-center' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Layer: Hollow Outline */}
      <span 
        className={`${sizeClasses[size]} font-black tracking-tighter text-transparent transition-all duration-1000 ${size === 'huge' ? 'block w-full' : 'inline-block'}`}
        style={{ 
          WebkitTextStroke: isHovered 
            ? (light ? '2px rgba(255,255,255,0.3)' : '2px #7c3aed33') 
            : (light ? '2px rgba(255,255,255,0.15)' : '2px rgb(var(--ink-400) / 0.1)'),
        }}
      >
        Jobly
      </span>

      {/* Top Layer: Solid Fill with Spotlight Mask */}
      <motion.span
        className={`absolute inset-0 ${sizeClasses[size]} font-black tracking-tighter pointer-events-none select-none ${size === 'huge' ? 'block w-full' : 'inline-block'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          color: light ? '#fff' : '#7c3aed',
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}
      >
        Jobly
      </motion.span>
    </div>
  );
};

export default Logo;
