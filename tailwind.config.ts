import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 👇 ก๊อปปี้ชุดนี้ไปใส่ครับ (รวมมิตรสีที่มักจะ Error)
        primary: "#4A6CF7", // สีหลัก (สีน้ำเงิน)
        secondary: "#9353d3", // สีรอง (ถ้ามี)
        dark: "#1D2144", // สี Dark Mode
        "body-color": "#959CB1", // <--- ตัวต้นเหตุของ Error รอบนี้!
        warning: "#FBBF24",

        // กันเหนียว: สีพื้นฐานบางที v4 ต้องการการประกาศซ้ำในบาง template
        black: "#090E34",
        white: "#ffffff",
      },
    },
  },
  darkMode: "class",
  plugins: [require("tailgrids/plugin"), heroui()],
};
export default config;
