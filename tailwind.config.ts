import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        brand: {
          50:  '#fef9ee',
          100: '#fdf0d5',
          200: '#faddaa',
          300: '#f6c474',
          400: '#f1a13c',
          500: '#ee8418',
          600: '#df6a0e',
          700: '#b94f0e',
          800: '#943e13',
          900: '#783513',
          950: '#411907',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
