import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'framer-motion';

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  triggerOnView?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export default function TextScramble({
  text,
  className = '',
  delay = 0,
  speed = 30,
  triggerOnView = true,
}: TextScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayText, setDisplayText] = useState(text);
  const [hasTriggered, setHasTriggered] = useState(false);

  const scramble = useCallback(() => {
    if (hasTriggered) return;
    setHasTriggered(true);

    const duration = speed * text.length;
    const startTime = Date.now() + delay * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);

      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charProgress = progress * text.length;
        if (charProgress > i) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    requestAnimationFrame(animate);
  }, [text, speed, delay, hasTriggered]);

  useEffect(() => {
    if (triggerOnView && isInView) {
      scramble();
    } else if (!triggerOnView) {
      scramble();
    }
  }, [isInView, triggerOnView, scramble]);

  return <span ref={ref} className={className}>{displayText}</span>;
}
