/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        furmily: {
          primary: '#054138',    // dark teal - main brand
          cream: '#F3CBC1',      // soft cream - accent
          gold: '#D4A574',       // warm gold
          light: '#FDF8F5',      // warm background
          gray: '#808BA7',       // muted gray
          dark: '#2D2D2D',       // dark text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};