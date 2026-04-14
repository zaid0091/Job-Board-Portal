/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                surface: {
                    50: 'rgb(var(--surface-50) / <alpha-value>)',
                    100: 'rgb(var(--surface-100) / <alpha-value>)',
                    200: 'rgb(var(--surface-200) / <alpha-value>)',
                    300: 'rgb(var(--surface-300) / <alpha-value>)',
                },
                ink: {
                    900: 'rgb(var(--ink-900) / <alpha-value>)',
                    800: 'rgb(var(--ink-800) / <alpha-value>)',
                    700: 'rgb(var(--ink-700) / <alpha-value>)',
                    600: 'rgb(var(--ink-600) / <alpha-value>)',
                    500: 'rgb(var(--ink-500) / <alpha-value>)',
                    400: 'rgb(var(--ink-400) / <alpha-value>)',
                    300: 'rgb(var(--ink-300) / <alpha-value>)',
                },
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'display-lg': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
                'display': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
                'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
                'heading': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
                'subheading': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '500' }],
                'body-lg': ['1.0625rem', { lineHeight: '1.65', fontWeight: '400' }],
                'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
                'micro': ['0.6875rem', { lineHeight: '1.45', fontWeight: '600', letterSpacing: '0.04em' }],
            },
            boxShadow: {
                'xs': '0 1px 2px 0 rgba(0,0,0,0.03)',
                'elevated': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.04), 0 8px 16px -4px rgba(0,0,0,0.06)',
                'elevated-lg': '0 0 0 1px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.04), 0 16px 40px -8px rgba(0,0,0,0.1)',
                'glow': '0 0 24px -4px rgba(124,58,237,0.25)',
                'glow-lg': '0 0 48px -8px rgba(124,58,237,0.3)',
                'inset-border': 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 24px -4px rgba(0,0,0,0.1)',
                'nav': '0 1px 0 0 rgba(0,0,0,0.04)',
                'input-focus': '0 0 0 3px rgba(124,58,237,0.12)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.25rem',
                '4xl': '1.5rem',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'grid-pattern': 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                'grid-pattern-dark': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
            },
            backgroundSize: {
                'grid': '64px 64px',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16,1,0.3,1)',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1)',
                'slide-down': 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)',
                'scale-in': 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
                'shimmer': 'shimmer 2.5s ease-in-out infinite',
                'skeleton': 'skeleton 1.8s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
                skeleton: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [],
};
