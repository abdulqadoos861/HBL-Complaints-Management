/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'hbl-green': '#008269',
        'hbl-dark': '#005a4b',
        'hbl-gold': '#ffc107',
      },
    },
  },
  plugins: [],
}
