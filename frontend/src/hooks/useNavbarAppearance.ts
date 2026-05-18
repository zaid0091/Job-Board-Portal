import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import {
  DARK_HERO_PATHS,
  HERO_PATHS,
  LIGHT_GEOMETRIC_HERO_PATHS,
  type HeroPath,
} from '@/constants/nav';

function isHeroPath(pathname: string): pathname is HeroPath {
  return (HERO_PATHS as readonly string[]).includes(pathname);
}

function isLightGeometricHeroPath(pathname: string): boolean {
  return (LIGHT_GEOMETRIC_HERO_PATHS as readonly string[]).includes(pathname);
}

function isDarkHeroPath(pathname: string): boolean {
  return (DARK_HERO_PATHS as readonly string[]).includes(pathname);
}

export type NavGlassVariant = 'light' | 'dark' | null;

export function useNavbarAppearance(scrolled: boolean, pastHero: boolean) {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  return useMemo(() => {
    const onHero = isHeroPath(pathname) && !pastHero;
    const onDarkHero = onHero && isDarkHeroPath(pathname);
    const onLightHero = onHero && isLightGeometricHeroPath(pathname) && theme === 'light';
    const onHeroOverlay = onHero && !onLightHero;

    const showNavBackground = scrolled || pastHero;

    const navGlass: NavGlassVariant = showNavBackground
      ? onDarkHero
        ? 'dark'
        : 'light'
      : null;

    /** White nav on dark heroes (transparent or dark frosted while still on hero). */
    const onHeroOverlayNav = onDarkHero || (onHeroOverlay && !showNavBackground);

    return { onHeroOverlay: onHeroOverlayNav, showNavBackground, navGlass };
  }, [pathname, theme, scrolled, pastHero]);
}
