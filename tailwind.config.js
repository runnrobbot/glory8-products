/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Glory8 Design System — matches reference project
        cream: {
          50:  '#FDFCF9',
          100: '#FAF8F4',
          200: '#F5F2EC',
          300: '#EDE9E0',
          400: '#E8E4DC',
          500: '#D4CAC0',
        },
        gold: {
          300: '#D4B570',
          400: '#C9A455',  // primary gold
          500: '#C9A455',
          600: '#B8933F',
          700: '#9A7B2E',
        },
        stone: {
          900: '#1C1917',  // primary dark
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#9C9890',
          300: '#C4BEB5',
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", 'serif'],
        body:    ["'Inter'", 'sans-serif'],
        sans:    ["'Inter'", 'sans-serif'],
      },
      boxShadow: {
        luxury:    '0 1px 20px rgba(0,0,0,0.04)',
        'luxury-md': '0 4px 40px rgba(0,0,0,0.08)',
        'luxury-lg': '0 8px 60px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
