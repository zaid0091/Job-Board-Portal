import { useEffect, useState } from 'react';
import {
  NAV_PAST_HERO_VIEWPORT_RATIO,
  NAV_SCROLL_THRESHOLD_PX,
} from '@/constants/nav';

export function useNavbarScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD_PX);
      setPastHero(window.scrollY > window.innerHeight * NAV_PAST_HERO_VIEWPORT_RATIO);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, pastHero };
}
