/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c2d0ff',
          300: '#9cb2ff',
          400: '#7088fc',
          500: '#4f62f8',
          600: '#3a42ed',
          700: '#3033d3',
          800: '#292caa',
          900: '#272b86',
          950: '#19194f',
        },
        slate: {
          925: '#0e1420',
        },
      },
    },
  },
  plugins: [],
}