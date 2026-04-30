import clientPromise from "@/lib/db";
import { NavItem } from "@/types/nav";
import NavbarClient from "./NavbarClient";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// บังคับให้ Navbar เป็น Dynamic Component และดึงข้อมูลใหม่เสมอ
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ปรับ Type ให้ _id เป็น string เสมอเพื่อให้เข้ากับ NavbarClient
export type MenuItem = NavItem & {
  _id: string;
  children?: MenuItem[];
};

async function getNavItems() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const items = await db
      .collection("navbar")
      .find({})
      .sort({ order: 1 })
      .toArray();

    if (!items || items.length === 0) {
      console.warn("⚠️ [Navbar] No nav items found in database");
      return [];
    }

    // บังคับ Type cast ให้ _id เป็น string และกรองข้อมูล
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
  const [menuTree, session] = await Promise.all([
    getNavItems(),
    auth()
  ]);

  let userImage = "";
  let username = session?.user?.name || (session?.user as any)?.username || "";
  let role = (session?.user as any)?.role || "";

  let userId = "";
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
      }
    } catch (error) {
      console.error("Fetch latest user data error:", error);
    }
  }

  return (
    <NavbarClient
      menuTree={menuTree}
      username={username}
      role={role}
      image={userImage}
      userId={userId}
    />
  );
}
