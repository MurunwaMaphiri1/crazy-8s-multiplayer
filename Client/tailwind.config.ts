import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'p5hatty': ['P5Hatty', 'sans-serif'],
      }
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
}
