import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { authConfig } from "@/auth.config";
import { ObjectId } from "mongodb";

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

          // --- 1. Rate Limiting Check ---
          const attemptsCollection = db.collection("login_attempts");
          const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
          
          // (TTL Index ใน MongoDB จะคอยจัดการลบข้อมูลที่เก่ากว่า 15 นาทีให้อัตโนมัติ แทนการใช้ deleteMany ตรงนี้)

          // ตรวจสอบการเข้าระบบผิดพลาดล่าสุด
          const recentAttempts = await attemptsCollection.countDocuments({ 
            username: cleanUsername,
            timestamp: { $gte: fifteenMinsAgo }
          });

          if (recentAttempts >= 5) {
            console.warn(`[AUTH] Rate limit exceeded for: "${cleanUsername}"`);
            throw new Error("บัญชีถูกระงับการเข้าสู่ระบบชั่วคราว (15 นาที) เนื่องจากพยายามเข้าระบบผิดพลาดหลายครั้ง");
          }

          // 2. ค้นหาผู้ใช้ในฐานข้อมูล (ค้นหาจาก username หรือ citizenId)
          console.log(`[AUTH] Querying database for: "${cleanUsername}"...`);
          let user = await db
            .collection("users")
            .findOne({
              $or: [
                { username: cleanUsername },
                { citizenId: cleanUsername }
              ]
            });

          // หากไม่พบ และไม่ใช่ตัวเลขล้วน (ไม่ใช่รหัสนักศึกษา หรือรหัสบัตรประชาชน) ให้ค้นหาแบบ case-insensitive (Fallback)
          if (!user && isNaN(Number(cleanUsername))) {
            user = await db
              .collection("users")
              .findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } });
          }

          if (!user) {
            console.warn(`[AUTH] User not found: "${cleanUsername}"`);
            await attemptsCollection.insertOne({ username: cleanUsername, timestamp: new Date() });
            throw new Error("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
          }

          console.log(`[AUTH] User found: ${user.username} (ID: ${user._id})`);

          // 3. ตรวจสอบความถูกต้องของรหัสผ่าน
          let isPasswordCorrect = false;
          
          if (user.password) {
            try {
              isPasswordCorrect = await bcrypt.compare(
                credentials.password as string,
                user.password,
              );
            } catch (bcryptError: any) {
              console.error(`[AUTH] bcrypt.compare failed for "${cleanUsername}":`, bcryptError?.message);
              throw new Error("เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ");
            }
          }

          // เพิ่มการรองรับการเข้าสู่ระบบด้วยเบอร์โทร (phone) เป็นรหัสผ่าน
          if (!isPasswordCorrect && user.phone && credentials.password === user.phone) {
            isPasswordCorrect = true;
          }

          // ตรวจสอบว่า user ไม่มีรหัสผ่านและไม่ได้ใช้เบอร์โทรที่ถูกต้อง
          if (!isPasswordCorrect && !user.password) {
            console.warn(`[AUTH] No password set for: "${cleanUsername}"`);
            throw new Error("บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ");
          }

          if (!isPasswordCorrect) {
            console.warn(`[AUTH] Incorrect password for: "${cleanUsername}"`);
            await attemptsCollection.insertOne({ username: cleanUsername, timestamp: new Date() });
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          // 4. ตรวจสอบสถานะบัญชี (ถ้าโดนระงับ isActive จะเป็น false)
          if (user.isActive === false) {
            console.warn(`[AUTH] Account disabled: "${cleanUsername}"`);
            if (user.role && user.role.toLowerCase() === "student") {
              throw new Error("บัญชีนักเรียนของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
            } else {
              throw new Error("บัญชีของคุณยังไม่ได้รับการอนุมัติการเข้าใช้งาน กรุณารอการอนุมัติจากผู้ดูแลระบบ");
            }
          }

          // 5. ถ้าผ่านทุกขั้นตอน ส่งข้อมูล User กลับไปเก็บใน Session
          await attemptsCollection.deleteMany({ username: cleanUsername }); // ล้างประวัติที่ผิดเมื่อเข้าได้
          
          return {
            id: user._id.toString(),
            name: user.name || user.username,
            username: user.username,
            role: (user.role || "user").toLowerCase(),
            image: user.image || "",
            department: user.department || "",
            faction: user.faction || "",
            sessionId: crypto.randomUUID(),
          };
        } catch (error: any) {
          const message = error?.message || String(error) || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
          console.error(`[AUTH] Authorize Error for "${cleanUsername}":`, message);
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session, account }) {
      // 1. เรียกใช้ jwt callback เดิมจาก auth.config.ts (เพื่อแมปข้อมูลเริ่มต้นตอน login)
      let newToken = token;
      if (authConfig.callbacks?.jwt) {
        newToken = await (authConfig.callbacks.jwt as any)({ token, user, trigger, session, account });
      }
      
      // 2. ตรวจสอบสถานะ User จาก Database โดยตรง (ย้ายมาจาก auth.config.ts เพื่อเลี่ยง fetch loopback timeout)
      const now = Date.now();
      const lastChecked = (newToken.lastChecked as number) || (newToken.loginTimestamp as number) || now;
      
      // Changed interval to 60000ms (1 min) for quicker session invalidation
      if (newToken.id && (now - lastChecked > 60000)) {
        try {
          const client = await clientPromise;
          const db = client.db("ktltc_db");
          
          if (ObjectId.isValid(newToken.id as string)) {
             const dbUser = await db.collection("users").findOne(
               { _id: new ObjectId(newToken.id as string) },
               { projection: { role: 1, department: 1, faction: 1, isActive: 1, logoutAllBefore: 1, exemptSessionId: 1 } }
             );
             // ถ้าระบบระงับบัญชี (isActive = false) หรือลบบัญชีไปแล้ว ให้เตะออกจากระบบ
             if (!dbUser || dbUser.isActive === false) {
                return {}; 
             }

             // ตรวจสอบการ Logout All Devices
             if (dbUser.logoutAllBefore && newToken.loginTimestamp && (newToken.loginTimestamp as number) < dbUser.logoutAllBefore) {
               // ถ้า Token นี้เก่ากว่าเวลาที่กด Logout All และไม่ใช่ Session ที่กดยกเว้นไว้
               if (dbUser.exemptSessionId !== newToken.sessionId) {
                 return {}; // ล้าง Token ทิ้งเพื่อเตะออกจากระบบ
               }
             }

             // อัปเดตสิทธิ์ใหม่ล่าสุดเข้า Token
             newToken.role = dbUser.role;
             newToken.department = dbUser.department;
             newToken.faction = dbUser.faction;
             newToken.lastChecked = now;
          }
        } catch (err) {
          console.warn("[JWT Node] Failed to verify token freshness:", err);
        }
      }
      return newToken;
    }
  }
});

/**
 * hasPermission: ฟังก์ชันสำหรับตรวจสอบสิทธิ์การเข้าถึงฟังก์ชันต่างๆ (Granular Permissions)
 * 
 * หน้าที่: ตรวจสอบว่าบทบาท (Role) ของผู้ใช้มีสิทธิ์ใช้งาน Feature นั้นๆ หรือไม่
 * ใช้ใน: API Routes หรือ Server Components ที่ต้องการความปลอดภัยสูง
 */
export async function hasPermission(role: string, feature: string, department?: string): Promise<boolean> {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  
  // สิทธิ์สูงสุด (super_admin) สามารถผ่านได้ทุกด่านเสมอ
  if (roleLower === "super_admin") return true;

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    // ค้นหาตารางสิทธิ์ (role_permissions) จากฐานข้อมูล
    const rolePermissions = await db.collection("role_permissions").findOne({ role: roleLower });
    
    let hasRolePermission = false;
    if (rolePermissions && rolePermissions.permissions) {
      hasRolePermission = !!rolePermissions.permissions[feature];
    }

    if (hasRolePermission) return true;

    // ตรวจสอบสิทธิ์จากแผนก (department_permissions) ถ้ามีการส่ง department มา
    if (department) {
      const deptPermissions = await db.collection("department_permissions").findOne({ department });
      if (deptPermissions && deptPermissions.permissions) {
        return !!deptPermissions.permissions[feature];
      }
    }

    return false;
  } catch (error) {
    console.error("hasPermission Error:", error);
    return false;
  }
}

