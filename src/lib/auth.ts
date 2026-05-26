import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { authConfig } from "@/auth.config";

/**
 * auth.ts: ไฟล์หลักสำหรับระบบ Authentication (NextAuth v5)
 * 
 * หน้าที่: 
 * 1. กำหนดวิธีการ Login (ในที่นี้ใช้ Credentials หรือ Username/Password)
 * 2. ตรวจสอบความถูกต้องของรหัสผ่านในฐานข้อมูล
 * 3. จัดการ Session ของผู้ใช้
 * 4. ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึง (RBAC - Role Based Access Control)
 * 
 * ความเชื่อมโยง:
 * - ถูกเรียกใช้ในไฟล์ API: src/app/api/auth/[...nextauth]/route.ts
 * - ถูกเรียกใช้ในหน้า Server Components เพื่อดึงข้อมูล User ปัจจุบัน
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // ดึงการตั้งค่าพื้นฐานมาจากไฟล์ auth.config.ts
  providers: [
    // กำหนดการเข้าสู่ระบบด้วย Username และ Password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้ตอนกดปุ่ม Login
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
        }

        const cleanUsername = (credentials.username as string).trim();
        console.log(`[AUTH] Attempting login for: "${cleanUsername}"`);

        try {
          const client = await clientPromise;
          const db = client.db("ktltc_db");

          // 1. ค้นหาผู้ใช้ในฐานข้อมูล (ค้นหาแบบไม่สนตัวพิมพ์เล็ก-ใหญ่)
          console.log(`[AUTH] Querying database for: "${cleanUsername}"...`);
          const user = await db
            .collection("users")
            .findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } });

          if (!user) {
            console.warn(`[AUTH] User not found: "${cleanUsername}"`);
            throw new Error("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
          }

          console.log(`[AUTH] User found: ${user.username} (ID: ${user._id})`);

          // 2. ตรวจสอบความถูกต้องของรหัสผ่าน (เปรียบเทียบรหัสผ่านที่กรอกมากับรหัสผ่านที่เข้ารหัสไว้ใน DB)
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

          if (!isPasswordCorrect) {
            console.warn(`[AUTH] Incorrect password for: "${cleanUsername}"`);
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          // 3. ตรวจสอบสถานะบัญชี (ถ้าโดนระงับ isActive จะเป็น false)
          if (user.isActive === false) {
            console.warn(`[AUTH] Account disabled: "${cleanUsername}"`);
            if (user.role && user.role.toLowerCase() === "student") {
              throw new Error("บัญชีนักเรียนของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
            } else {
              throw new Error("บัญชีของคุณยังไม่ได้รับการอนุมัติการเข้าใช้งาน กรุณารอการอนุมัติจากผู้ดูแลระบบ");
            }
          }

          // 4. ถ้าผ่านทุกขั้นตอน ส่งข้อมูล User กลับไปเก็บใน Session
          return {
            id: user._id.toString(),
            name: user.name || user.username,
            username: user.username,
            role: (user.role || "user").toLowerCase(),
            image: user.image || "",
          };
        } catch (error: any) {
          console.error(`[AUTH] Authorize Error:`, error.message);
          throw error;
        }
      },
    }),
  ],
});

/**
 * hasPermission: ฟังก์ชันสำหรับตรวจสอบสิทธิ์การเข้าถึงฟังก์ชันต่างๆ (Granular Permissions)
 * 
 * หน้าที่: ตรวจสอบว่าบทบาท (Role) ของผู้ใช้มีสิทธิ์ใช้งาน Feature นั้นๆ หรือไม่
 * ใช้ใน: API Routes หรือ Server Components ที่ต้องการความปลอดภัยสูง
 */
export async function hasPermission(role: string, feature: string): Promise<boolean> {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  
  // สิทธิ์สูงสุด (super_admin) สามารถผ่านได้ทุกด่านเสมอ
  if (roleLower === "super_admin") return true;

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    // ค้นหาตารางสิทธิ์ (role_permissions) จากฐานข้อมูล
    const rolePermissions = await db.collection("role_permissions").findOne({ role: roleLower });
    
    if (!rolePermissions || !rolePermissions.permissions) return false;
    
    // ตรวจสอบว่า Feature ที่ระบุมีค่าเป็น true หรือไม่
    return !!rolePermissions.permissions[feature];
  } catch (error) {
    console.error("hasPermission Error:", error);
    return false;
  }
}

