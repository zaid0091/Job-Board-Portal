import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import {
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

export function useNavbarAppearance(scrolled: boolean, pastHero: boolean) {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  return useMemo(() => {
    const onHero = isHeroPath(pathname) && !pastHero;
    const onLightHero = onHero && isLightGeometricHeroPath(pathname) && theme === 'light';
    const onHeroOverlay = onHero && !onLightHero;
    const lightHeroFrostedBar = onLightHero && scrolled;
    const showNavBackground =
      (scrolled && !isHeroPath(pathname)) || pastHero || lightHeroFrostedBar;

    return { onHeroOverlay, showNavBackground };
  }, [pathname, theme, scrolled, pastHero]);
}
