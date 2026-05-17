import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  startOnInView?: boolean;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
  startOnInView = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasStarted, setHasStarted] = useState(!startOnInView);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 20,
  });

  useEffect(() => {
    if (isInView && startOnInView && !hasStarted) {
      setHasStarted(true);
    }
  }, [isInView, startOnInView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    motionValue.set(value);

    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimals) + suffix;
      }
    });

    return () => unsubscribe();
  }, [hasStarted, value, springValue, motionValue, prefix, suffix, decimals]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
