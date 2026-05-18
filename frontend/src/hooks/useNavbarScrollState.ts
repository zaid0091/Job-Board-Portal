import { useEffect, useState } from 'react';
import {
  NAV_PAST_HERO_VIEWPORT_RATIO,
  NAV_SCROLL_THRESHOLD_PX,
} from '@/constants/nav';

export const LENIS_SCROLL_EVENT = 'jobly:scroll';

function readScrollY(detailY?: number): number {
  if (typeof detailY === 'number') {
    return detailY;
  }
  return window.scrollY;
}

export function useNavbarScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const update = (detailY?: number) => {
      const y = readScrollY(detailY);
      setScrolled(y > NAV_SCROLL_THRESHOLD_PX);
      setPastHero(y > window.innerHeight * NAV_PAST_HERO_VIEWPORT_RATIO);
    };

    update();

    const onWindowScroll = () => update();
    const onLenisScroll = (event: Event) => {
      const y = (event as CustomEvent<{ y: number }>).detail?.y;
      update(y);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    window.addEventListener(LENIS_SCROLL_EVENT, onLenisScroll);

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener(LENIS_SCROLL_EVENT, onLenisScroll);
    };
  }, []);

  return { scrolled, pastHero };
}
