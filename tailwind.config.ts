/** @type {import('tailwindcss').Config} */

import { fontFamily } from 'tailwindcss/defaultTheme';

module.exports = {
  mode: process.env['NODE_ENV'] ? 'jit' : undefined,
  content: ['./index.html', './src/**/*.{html,ts, scss, css, sass}'],
  theme: {
    fontFamily: {
      ...fontFamily,
      sans: [
        'Inter',
        'Roboto',
        'Helvetica Neue',
        'sans-serif',
        ...fontFamily.sans,
      ],
    },
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          a100: 'var(--primary-a100)',
          a200: 'var(--primary-a200)',
          a400: 'var(--primary-a400)',
          a700: 'var(--primary-a700)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          a100: 'var(--secondary-a100)',
          a200: 'var(--secondary-a200)',
          a400: 'var(--secondary-a400)',
          a700: 'var(--secondary-a700)',
        },
        accent: {
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
          900: 'var(--accent-900)',
          a100: 'var(--accent-a100)',
          a200: 'var(--accent-a200)',
          a400: 'var(--accent-a400)',
          a700: 'var(--accent-a700)',
        },
        warn: {
          50: 'var(--warn-50)',
          100: 'var(--warn-100)',
          200: 'var(--warn-200)',
          300: 'var(--warn-300)',
          400: 'var(--warn-400)',
          500: 'var(--warn-500)',
          600: 'var(--warn-600)',
          700: 'var(--warn-700)',
          800: 'var(--warn-800)',
          900: 'var(--warn-900)',
          a100: 'var(--warn-a100)',
          a200: 'var(--warn-a200)',
          a400: 'var(--warn-a400)',
          a700: 'var(--warn-a700)',
        },
        f3f3f3: '#f3f3f3',
        '3498db': '#3498db',
      },
      backgroundColor: {
        'white-80': 'rgba(255, 255, 255, 0.8)',
      },
      zIndex: {
        9999: '9999',
      },
      borderWidth: {
        16: '16px',
      },
      animation: {
        spin: 'spin 2s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-before-after': {
          '&::before': {
            'border-width': '0 !important',
            'border-style': 'none !important',
          },
          '&::after': {
            'border-width': '0 !important',
            'border-style': 'none !important',
          },
        },
      });
    },
  ],
};
