const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */

console.log(colors.indigo);
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: {
        50: "var(--indigo-50)",
        100: "var(--indigo-100)",
        200: "var(--indigo-200)",
        300: "var(--indigo-300)",
        400: "var(--indigo-400)",
        500: "var(--indigo-500)",
        600: "var(--indigo-600)",
        700: "var(--indigo-700)",
        800: "var(--indigo-800)",
        900: "var(--indigo-900)",
        950: "var(--indigo-950)",
      },
      yellow: colors.yellow,
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
