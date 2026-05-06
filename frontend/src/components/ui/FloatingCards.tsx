import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface FloatingCardsProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  stagger?: number;
  containerOffset?: [number, number];
}

export default function FloatingCards({
  children,
  className = '',
  direction = 'up',
  distance = 100,
  stagger = 0.1,
  containerOffset = ['start end', 'end start'],
}: FloatingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: containerOffset,
  });

  const directionMap: Record<string, [string, string]> = {
    up: ['y', `${distance}px`],
    down: ['y', `-${distance}px`],
    left: ['x', `${distance}px`],
    right: ['x', `-${distance}px`],
  };

  const [axis, fromValue] = directionMap[direction] || directionMap['up'];

  const value = useTransform(scrollYProgress, [0, 1], [fromValue, '0px']);

  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div ref={containerRef} className={className}>
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          style={{
            [axis]: useTransform(scrollYProgress, [0, 1], [fromValue, '0px']),
            opacity: useTransform(scrollYProgress, [index * stagger, index * stagger + 0.3], [0, 1]),
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
