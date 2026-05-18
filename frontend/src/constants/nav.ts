/** Scroll offset (px) before the navbar shows a frosted background. */
export const NAV_SCROLL_THRESHOLD_PX = 4;

/** Viewport height fraction before hero pages treat scroll as "past hero". */
export const NAV_PAST_HERO_VIEWPORT_RATIO = 0.7;

export const HERO_PATHS = ['/', '/about', '/contact'] as const;

export type HeroPath = (typeof HERO_PATHS)[number];

export const LIGHT_GEOMETRIC_HERO_PATHS = ['/about', '/contact'] as const;
