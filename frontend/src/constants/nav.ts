/** Scroll offset (px) before the navbar shows a frosted background. */
export const NAV_SCROLL_THRESHOLD_PX = 4;

/** Viewport height fraction before hero pages treat scroll as "past hero". */
export const NAV_PAST_HERO_VIEWPORT_RATIO = 0.7;

export const HERO_PATHS = ['/', '/jobs', '/about', '/contact'] as const;

export type HeroPath = (typeof HERO_PATHS)[number];

/** Light heroes: transparent ink nav at top; frosted bar after scroll (light mode). */
export const LIGHT_GEOMETRIC_HERO_PATHS = ['/jobs', '/about', '/contact'] as const;

/** Dark full-bleed heroes (Home): dark frosted bar + white nav while over the hero. */
export const DARK_HERO_PATHS = ['/'] as const;
