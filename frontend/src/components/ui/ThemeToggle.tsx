import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  /** Render variant for the hero overlay */
  onHero?: boolean;
}

export default function ThemeToggle({ onHero = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
        onHero
          ? 'text-white/70 hover:text-white hover:bg-white/10'
          : 'text-ink-400 hover:text-ink-600 hover:bg-surface-100'
      }`}
      style={{
        boxShadow: isDark
          ? '0 0 16px -3px rgba(139,92,246,0.25)'
          : 'none',
      }}
    >
      {/* Sun */}
      <SunIcon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-spring ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      {/* Moon */}
      <MoonIcon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-spring ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
