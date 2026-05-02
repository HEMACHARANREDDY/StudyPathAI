/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#050E1F",
          800: "#0A1628",
          700: "#112240",
          600: "#162A48",
        },
        teal: {
          400: "#00D4B8",
          500: "#00A896",
        },
        gold: "#FFD166",
        coral: "#FF6B6B",
        purple: "#9B59FF",
        emerald: "#06D6A0",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(20px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        glow: { from: { boxShadow: "0 0 10px #00D4B8" }, to: { boxShadow: "0 0 25px #00D4B8, 0 0 50px rgba(0,212,184,0.3)" } },
      },
    },
  },
  plugins: [],
};
