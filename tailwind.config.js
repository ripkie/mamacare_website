/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: '#FFFFFF',
          black: '#000000',
          red: '#FF0000',
          yellow1: '#FBCC25',
          yellow2: '#FFB00B',
          'yellow1-light': '#FEF3C7',
          'yellow2-light': '#FFF7E6',
          navy: '#1E2A3B',
          'navy-light': '#2D3E55',
          'gray-soft': '#F8F9FA',
          'gray-border': '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 16px 0 rgba(30,42,59,0.07)',
        'card': '0 4px 24px 0 rgba(30,42,59,0.09)',
        'glow-yellow': '0 0 0 3px rgba(251,204,37,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-soft': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
