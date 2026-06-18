/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index-en.html",
    "./planes/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'void-black': '#050505',
        'electric-cyan': '#00f2ff',
        'deep-ocean': '#001a2c',
        'slate-gray': '#8ba2b2',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        display: ['Modak', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
