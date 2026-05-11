import clientPromise from "@/lib/db";
import { NavItem } from "@/types/nav";
import NavbarClient from "./NavbarClient";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

/**
 * Navbar.tsx (Server Component): คอมโพเนนต์แถบเมนูด้านบนฝั่ง Server
 * 
 * หน้าที่: 
 * 1. ดึงข้อมูลรายการเมนู (Navigation Items) จากฐานข้อมูล MongoDB
 * 2. ตรวจสอบข้อมูล Session ของผู้ใช้ที่ Login อยู่
 * 3. ดึงข้อมูลสิทธิ์ (Permissions) ตามบทบาท (Role) ของผู้ใช้
 * 4. ส่งข้อมูลทั้งหมดไปยัง NavbarClient เพื่อเรนเดอร์หน้าจอ
 */

// บังคับให้ Navbar ดึงข้อมูลใหม่เสมอ (ไม่ใช้ Cache) เพื่อให้ข้อมูลเมนูอัปเดตแบบ Real-time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export type MenuItem = NavItem & {
  _id: string;
  children?: MenuItem[];
};

/**
 * getNavItems: ดึงข้อมูลโครงสร้างเมนูจากคอลเลกชัน 'navbar'
 */
async function getNavItems() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const items = await db
      .collection("navbar")
      .find({})
      .sort({ order: 1 }) // เรียงตามลำดับที่กำหนดไว้
      .toArray();

    if (!items || items.length === 0) {
      console.warn("⚠️ [Navbar] No nav items found in database. Using fallback menu.");
      // สร้างข้อมูลเมนูสำรองให้ตรงกับ Type NavItem (title, url)
      return [
        { _id: "f1", title: "หน้าแรก", url: "/", order: 1, label: "หน้าแรก", path: "/" },
        { _id: "f2", title: "ข่าวประชาสัมพันธ์", url: "/news", order: 2, label: "ข่าวประชาสัมพันธ์", path: "/news" },
        { _id: "f3", title: "ข้อมูลพื้นฐาน", url: "/about", order: 3, label: "ข้อมูลพื้นฐาน", path: "/about" },
        { _id: "f4", title: "บุคลากร", url: "/personnel", order: 4, label: "บุคลากร", path: "/personnel" },
        { _id: "f5", title: "ติดต่อเรา", url: "/contact", order: 5, label: "ติดต่อเรา", path: "/contact" },
      ] as MenuItem[];
    }

    // แปลงข้อมูลและสร้างโครงสร้างแบบ Tree (Parent-Children)
    const allItems = JSON.parse(JSON.stringify(items)) as (NavItem & {
      _id: string;
    })[];

    const parents = allItems.filter((item) => !item.parentId);
    const menuTree = parents.map((parent) => {
      const children = allItems.filter(
        (child) => child.parentId === parent._id,
      );
      return { ...parent, children };
    }) as MenuItem[];

    return menuTree;
  } catch (error) {
    console.error("❌ Failed to fetch nav items:", error);
    return [];
  }
}

export default async function Navbar() {
  // ดึงข้อมูลเมนูและ Session ไปพร้อมๆ กัน (Parallel Fetching)
  const [menuTree, session] = await Promise.all([
    getNavItems(),
    auth()
  ]);

  let userImage = "";
  let username = session?.user?.name || (session?.user as any)?.username || "";
  let role = (session?.user as any)?.role || "";

  let permissions = null;
  let userId = "";

  // ถ้าผู้ใช้ Login อยู่ ให้ไปดึงข้อมูลล่าสุดจากฐานข้อมูล (เพื่อความแม่นยำกว่าข้อมูลใน Cookie)
  if (session?.user) {
    try {
      userId = (session.user as any).id || (session as any).userId || "";

      if (userId && ObjectId.isValid(userId)) {
        const client = await clientPromise;
        const db = client.db("ktltc_db");
        const userData = await db
          .collection("users")
          .findOne({ _id: new ObjectId(userId) });

        if (userData) {
          userImage = userData.image || "";
          username = userData.name || userData.username || username;
          role = (userData.role || "user").trim().toLowerCase();
        }

        // ดึงสิทธิ์ (Permissions) ของบทบาทนี้
        const rolePermissions = await db
          .collection("role_permissions")
          .findOne({ role: role });

        if (rolePermissions) {
          permissions = rolePermissions.permissions;
        } else if (role === "super_admin") {
          // กรณีไม่มีข้อมูลในฐานข้อมูล แต่เป็น super_admin ให้สิทธิ์เต็มเสมอ
          permissions = {
            access_dashboard: true,
            manage_users: true,
            manage_news: true,
            manage_attendance: true,
            manage_system: true,
            manage_qa: true,
            manage_pages: true,
          };
        }
      }
    } catch (error) {
      console.error("Fetch latest user data error:", error);
    }
  }

  // ส่งข้อมูลที่รวบรวมได้ไปยัง NavbarClient (Client Component) เพื่อแสดงผลและจัดการ Interaction
  return (
    <NavbarClient
      menuTree={menuTree}
      username={username}
      role={role}
      image={userImage}
      userId={userId}
      permissions={permissions}
    />
  );
}

