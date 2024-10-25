/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ['selector', '[data-mode="dark"]'],
theme: {
    extend: {
      fontFamily: {
        cutmark: ["Cutmark Narrow", "sans-serif"],
      },
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wave: {
                "0%": { transform: "rotate(0.0deg)" },
                "10%": { transform: "rotate(14deg)" },
                "20%": { transform: "rotate(-8deg)" },
                "30%": { transform: "rotate(14deg)" },
                "40%": { transform: "rotate(-4deg)" },
                "50%": { transform: "rotate(10.0deg)" },
                "60%": { transform: "rotate(0.0deg)" },
                "100%": { transform: "rotate(0.0deg)" },
            },
      },
      animation: {
        'spin-slow': 'spin-slow 3s linear infinite', // Adjust the duration as needed
        "waving-hand": "wave 2s linear infinite",
      },
    },
  },
  plugins: [],
};
