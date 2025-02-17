import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        ...colors,
      }),
    },
  },
  darkMode: "class",
  plugins: [require("tailgrids/plugin"), heroui()],
};
export default config;
