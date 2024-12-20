/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "bg-black": "#0E0E0E",
        primary: "purple-600",
        "light-primary": "purple-600",
        white: "#ffffff",
        grey: "#1D1B1B",
        "light-white": "#ffffff",
        navbg: "rgb(8, 8, 8)",
      },
    },
  },
  plugins: [],
};
