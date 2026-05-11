import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
        }

        const cleanUsername = (credentials.username as string).trim();
        console.log(`[AUTH] Attempting login for: "${cleanUsername}"`);

        try {
          const client = await clientPromise;
          const db = client.db("ktltc_db");

          // ค้นหา username แบบ Case-insensitive
          console.log(`[AUTH] Querying database for: "${cleanUsername}"...`);
          const user = await db
            .collection("users")
            .findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } });

          if (!user) {
            console.warn(`[AUTH] User not found: "${cleanUsername}"`);
            throw new Error("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
          }

          console.log(`[AUTH] User found: ${user.username} (ID: ${user._id})`);

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

          if (!isPasswordCorrect) {
            console.warn(`[AUTH] Incorrect password for: "${cleanUsername}"`);
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          if (user.isActive === false) {
            console.warn(`[AUTH] Account disabled: "${cleanUsername}"`);
            throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
          }

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
 * ตรวจสอบสิทธิ์การเข้าถึงฟังก์ชันแบบ Granular (สำหรับใช้ใน API Routes)
 */
export async function hasPermission(role: string, feature: string): Promise<boolean> {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  
  // Super Admin มีสิทธิ์ทุกอย่างเสมอ
  if (roleLower === "super_admin") return true;

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const rolePermissions = await db.collection("role_permissions").findOne({ role: roleLower });
    
    if (!rolePermissions || !rolePermissions.permissions) return false;
    
    return !!rolePermissions.permissions[feature];
  } catch (error) {
    console.error("hasPermission Error:", error);
    return false;
  }
}
