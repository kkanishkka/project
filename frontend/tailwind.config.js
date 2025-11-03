/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",

      // Backgrounds
      white: "#FDFDFE",
      black: "#0A0A0F",

      // Primary palette override
      gray: {
        50: "#F4F4F5",
        100: "#E4E4E7",
        200: "#D4D4D8",
        300: "#A1A1AA",
        400: "#71717A",
        500: "#52525B",
        600: "#3F3F46",
        700: "#27272A",
        800: "#18181B",
        900: "#0F0F12",
      },
      blue: {
        50: "#E0F2FE",
        100: "#BAE6FD",
        200: "#7DD3FC",
        300: "#38BDF8",
        400: "#0EA5E9",
        500: "#0284C7",
        600: "#0369A1",
        700: "#075985",
        800: "#0C4A6E",
        900: "#082F49",
      },
      pink: {
        50: "#FDF2F8",
        100: "#FCE7F3",
        200: "#FBCFE8",
        300: "#F9A8D4",
        400: "#F472B6",
        500: "#EC4899",
        600: "#DB2777",
        700: "#BE185D",
        800: "#9D174D",
        900: "#831843",
      },
      neon: {
        green: "#39FF14",
        pink: "#FF007F",
        cyan: "#00F5FF",
        purple: "#BC13FE",
        yellow: "#F9F871",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
