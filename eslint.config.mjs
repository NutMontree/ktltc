import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ✅ เพิ่มส่วนการตั้งค่า Rules ตรงนี้
  {
    rules: {
      "jsx-a11y/alt-text": "off", // ปิดการแจ้งเตือนเรื่อง alt text ในรูปภาพ
      "react-hooks/exhaustive-deps": "off", // ปิดการแจ้งเตือนเรื่อง dependencies ใน useEffect
      "@typescript-eslint/no-explicit-any": "off", // แถม: ปิดการด่าเรื่องใช้ any (ถ้าต้องการ)
      "@typescript-eslint/no-unused-vars": "warn", // ปรับตัวแปรที่ไม่ได้ใช้ให้เป็นแค่การเตือน (ไม่ Error)
      "@next/next/no-img-element": "off", // ✅ ปิดการแจ้งเตือนเรื่องการใช้แท็ก img ปกติ
      "react-hooks/purity": "off", // ✅ ปิดการแจ้งเตือนเรื่อง Hook Purity ( Side Effects ใน Render )
      "react-hooks/immutability": "off", // ✅ ปิดการแจ้งเตือนเรื่อง Immutability (การแก้ไขค่าตัวแปรโดยตรงใน Hooks)
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },

  // Override default ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
