import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  /** Render variant for the hero overlay */
  onHero?: boolean;
}

export default function ThemeToggle({ onHero = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer ${
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
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <MoonIcon className="h-[18px] w-[18px]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <SunIcon className="h-[18px] w-[18px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
