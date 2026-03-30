/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3edff',
          100: '#e4d4ff',
          200: '#ccabff',
          300: '#aa74ff',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'scan': 'scan 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'gradient-x': 'gradient-x 4s ease infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 4px currentColor' },
          '50%': { opacity: '0.6', boxShadow: '0 0 12px currentColor, 0 0 24px currentColor' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '0.6' },
          '100%': { top: '100%', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        flicker: {
          '0%, 96%, 100%': { opacity: '1' },
          '97%': { opacity: '0.6' },
          '98%': { opacity: '1' },
          '99%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
