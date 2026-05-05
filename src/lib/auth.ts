import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "ชื่อผู้ใช้งาน", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("ktltc_db");
        
        const cleanUsername = (credentials.username as string).trim();
        console.log(`[AUTH] Attempting login for: "${cleanUsername}"`);

        // ค้นหา username แบบ Case-insensitive
        const user = await db
          .collection("users")
          .findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } });

        if (!user) {
          console.warn(`[AUTH] User not found: "${cleanUsername}"`);
          throw new Error("ไม่พบผู้ใช้งานในระบบ");
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

        // ✅ ตรวจสอบว่า Super Admin อนุมัติบัญชีแล้วหรือยัง
        if (user.isActive === false) {
          console.warn(`[AUTH] Account not active: "${cleanUsername}"`);
          throw new Error("บัญชีของคุณยังรอการอนุมัติจาก Super Admin กรุณาติดต่อผู้ดูแลระบบ");
        }

        // ✅ สร้างเลข session ID ใหม่ทุกครั้งที่ล็อกอิน (ใช้ UUID ที่เสถียร)
        const sessionId = randomUUID();

        // ✅ ล้าง global session cache ของ user คนนี้ออกทั้งหมด (ช่วยให้ Login ใหม่ เคลียร์ error เก่า)
        if ((global as any)._sessionCache) {
          const userId = user._id.toString();
          Object.keys((global as any)._sessionCache).forEach((key) => {
            if (key.startsWith(`sess_${userId}_`)) {
              delete (global as any)._sessionCache[key];
            }
          });
        }

        // ✅ บันทึก sessionId ของปัจจุบันทับลงในฐานข้อมูล
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { currentSessionId: sessionId } }
        );

        return {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email || null,
          role: (user.role || "user").toLowerCase(), // ✅ บังคับเป็นพิมพ์เล็กเสมอกัน
          image: user.image || null,
          sessionId, // ส่งต่อไปให้ jwt callback
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 1. กำหนดค่าเริ่มต้นเมื่อล็อกอินใหม่ ๆ
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.image = (user as any).image;
        token.sessionId = (user as any).sessionId;
        token.loginTimestamp = Date.now();
      }

      const role = token.role as string;

      // 2. ลบออก: ตรวจสอบเงื่อนไขหมดเวลา 1 ชั่วโมง (User สามารถใช้งานได้ไม่จำกัดเวลา)

      // 3. ลบออก: ตรวจสอบการเข้าสู่ระบบซ้อนกัน (User สามารถเข้าใช้งานได้หลายเครื่องพร้อมกัน)

      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        (session as any).error = token.error;
      }
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).image = token.image;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
});
