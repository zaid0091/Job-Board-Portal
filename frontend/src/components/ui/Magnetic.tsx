import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Advanced GSAP-powered Magnetic component.
 * Pulls the children towards the cursor within a certain radius.
 */
export default function Magnetic({ children, strength = 40, className }: MagneticProps) {
  const magnetic = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const xTo = gsap.quickTo(magnetic.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(magnetic.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = magnetic.current!.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * (strength / 100));
      yTo(y * (strength / 100));
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    magnetic.current?.addEventListener("mousemove", handleMouseMove);
    magnetic.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      magnetic.current?.removeEventListener("mousemove", handleMouseMove);
      magnetic.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={magnetic} className={className}>
      {children}
    </div>
  );
}
