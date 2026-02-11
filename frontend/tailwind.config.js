/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dashboard theme colors
        dark: {
          900: '#0a0e27',
          800: '#1a0b2e',
          700: '#16213e',
          600: '#1e293b',
          500: '#334155',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          indigo: '#6366f1',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        priority: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#10b981',
        },
      },
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
