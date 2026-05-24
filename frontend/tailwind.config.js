/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        savomart: {
          purple: '#782B90',
          yellow: '#FFF200',
          darkPurple: '#5c2070',
          lightYellow: '#fff999',
          lightGray: '#f8f4fa'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
