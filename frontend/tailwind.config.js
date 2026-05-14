/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'hbl-green': '#00a997',
        'hbl-dark': '#004a44',
        'hbl-gold': '#c5a059',
      },
    },
  },
  plugins: [],
}
