import type { NextAuthConfig } from "next-auth";

const callbacks: NextAuthConfig["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role;
      token.username = (user as any).username;
      token.image = (user as any).image;
      token.sessionId = (user as any).sessionId;
      token.loginTimestamp = Date.now();
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).username = token.username;
      (session.user as any).image = token.image;
    }
    return session;
  },
  authorized({ auth, request: { nextUrl } }) {
    // ปิดการจัดการ Redirect ใน Middleware ชั่วคราวเพื่อแก้ปัญหา Redirect Loop
    // ให้แต่ละหน้า (เช่น /dashboard) จัดการตรวจสอบสิทธิ์เองผ่าน useSession หรือ auth()
    return true;
  },
  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    else if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },
};

export const authConfig = {
  providers: [],
  callbacks,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  debug: true,
} satisfies NextAuthConfig;
