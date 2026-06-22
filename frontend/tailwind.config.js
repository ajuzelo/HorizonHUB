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
          base: '#0F1117',       // primary background
          surface: '#161B27',    // cards, panels
          elevated: '#1C2333',   // elevated elements
          overlay: '#232B3E',    // tooltips, popovers
          muted: '#2A3347',      // muted elements
        },
        // Gold accent system
        gold: {
          DEFAULT: '#FFD700',
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF176',
          300: '#FFEE58',
          400: '#FFCA28',
          500: '#FFD700',
          600: '#F5C200',
          700: '#E5A900',
          800: '#CC8800',
          900: '#A36400',
          foreground: '#0F1117',
        },
        // Border system
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          subtle: 'rgba(255,255,255,0.04)',
          strong: 'rgba(255,255,255,0.12)',
          gold: 'rgba(255,215,0,0.2)',
        },
        // Text system
        text: {
          primary: '#F1F3F7',
          secondary: '#8B9AB0',
          muted: '#4E5E74',
          accent: '#FFD700',
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
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.15)',
        'gold': '0 0 20px rgba(255,215,0,0.15)',
        'gold-sm': '0 0 8px rgba(255,215,0,0.1)',
        'panel': '0 8px 32px rgba(0,0,0,0.5)',
        'input-focus': '0 0 0 2px rgba(255,215,0,0.25)',
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
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #F5C200 50%, #E5A900 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
        'gradient-surface': 'linear-gradient(180deg, #161B27 0%, #1C2333 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0F1117 0%, #0A0D14 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
