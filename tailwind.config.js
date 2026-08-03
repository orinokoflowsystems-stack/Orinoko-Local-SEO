/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce7ff',
          200: '#bfd2ff',
          300: '#94b4ff',
          400: '#618dff',
          500: '#3b6cff',
          600: '#254fe3',
          700: '#1e3a8a',
          800: '#1c3271',
          900: '#1b2d5b',
        },
        accent: {
          50: '#fff4ec',
          100: '#ffe6d4',
          200: '#ffc9a8',
          300: '#ffaa73',
          400: '#ff8c42',
          500: '#f97316',
          600: '#e55f0b',
          700: '#bd470c',
          800: '#973811',
          900: '#7a3012',
        },
      },
      screens: {
        xs: '480px',
        '3xl': '1920px',
      },
      maxWidth: {
        shell: '1440px',
      },
      boxShadow: {
        panel: '0 10px 35px -15px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'brand-grid':
          'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
