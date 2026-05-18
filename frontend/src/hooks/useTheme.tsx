import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_TRANSITION_MS = 500;

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    const apply = () => {
      root.classList.add('theme-transition');
      applyThemeClass(next);
      localStorage.setItem('theme', next);
      flushSync(() => setTheme(next));
    };

    const cleanup = () => {
      window.setTimeout(() => {
        root.classList.remove('theme-transition');
      }, THEME_TRANSITION_MS);
    };

    if (typeof document.startViewTransition === 'function') {
      const transition = document.startViewTransition(apply);
      transition.finished.then(cleanup).catch(cleanup);
    } else {
      apply();
      cleanup();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
