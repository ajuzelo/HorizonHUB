/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // === Horizon HUB Design Tokens ===
        // Background layers
        bg: {
          base: '#000000',       // primary background
          surface: '#0a0a0a',    // cards, panels
          elevated: '#111111',   // elevated elements
          overlay: '#171717',    // tooltips, popovers
          muted: '#262626',      // muted elements
        },
        // Gold accent system (repurposed to white/gray for minimalism)
        gold: {
          DEFAULT: '#ffffff',
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          foreground: '#000000',
        },
        // Border system
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          subtle: 'rgba(255,255,255,0.04)',
          strong: 'rgba(255,255,255,0.15)',
          gold: 'rgba(255,255,255,0.2)',
        },
        // Text system
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#52525B',
          accent: '#ffffff',
        },
        // Status colors
        success: { DEFAULT: '#22C55E', light: 'rgba(34,197,94,0.12)' },
        warning: { DEFAULT: '#F59E0B', light: 'rgba(245,158,11,0.12)' },
        danger:  { DEFAULT: '#EF4444', light: 'rgba(239,68,68,0.12)' },
        info:    { DEFAULT: '#3B82F6', light: 'rgba(59,130,246,0.12)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.15)',
        'gold': '0 0 20px rgba(255,255,255,0.15)',
        'gold-sm': '0 0 8px rgba(255,255,255,0.1)',
        'panel': '0 8px 32px rgba(0,0,0,0.8)',
        'input-focus': '0 0 0 2px rgba(255,255,255,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'slide-in-up': 'slideInUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255,215,0,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(255,215,0,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 50%, #d4d4d4 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
