/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f6b96d',
          400: '#f19332',
          500: '#ee7711',
          600: '#df5d07',
          700: '#b94509',
          800: '#93370f',
          900: '#772f10',
        }
      }
    },
  },
  plugins: [],
}
