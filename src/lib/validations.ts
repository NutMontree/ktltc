import { z } from "zod";

/**
 * Basic Validation Schemas for Application Security
 * Use these schemas in API routes to prevent XSS, NoSQL Injection, and validate user input.
 */

// 1. Username Validation (Alphanumeric only, 3-20 chars)
export const usernameSchema = z
  .string()
  .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
  .max(20, "ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 20 ตัวอักษร")
  .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่างเท่านั้น");

// 2. Password Validation (At least 6 chars)
export const passwordSchema = z
  .string()
  .min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
  .max(50, "รหัสผ่านต้องมีความยาวไม่เกิน 50 ตัวอักษร");

// 3. Email Validation
export const emailSchema = z.string().email("รูปแบบอีเมลไม่ถูกต้อง").max(100);

// 4. Safe Text Validation (For general inputs like titles, preventing basic XSS)
// This strictly checks for < and > which are common in XSS
export const safeTextSchema = z
  .string()
  .max(255)
  .refine((val) => !val.includes("<") && !val.includes(">"), {
    message: "ไม่อนุญาตให้ใช้เครื่องหมาย < หรือ > ในข้อความเพื่อความปลอดภัย",
  });

// Example Login Form Schema
export const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// Example Registration Form Schema
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema,
  name: safeTextSchema.min(1, "กรุณากรอกชื่อ-นามสกุล"),
});
