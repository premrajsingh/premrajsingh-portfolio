/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Syne'","sans-serif"],
        mono: ["'JetBrains Mono'","monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0.3 },
          "100%": { opacity: 1 },
        }
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
      }
    },
  },
  plugins: [],
}
