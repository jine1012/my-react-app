// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        butter: {
          DEFAULT: "#FFF3B0",
          50: "#FFFBEA",
          100: "#FFF7D6",
        },
        cocoa: {
          DEFAULT: "#6B4226",
          50: "#EAD9CF",
          100: "#D1B7A6",
        }
      }
    }
  },
  plugins: [],
}
