import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

// ฟังก์ชันสร้าง Slug
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// --- POST: สร้างข่าวใหม่ ---
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = (session?.user as any)?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageNews = rolePerms?.permissions?.manage_news || userRole === "super_admin";

    if (!canManageNews && !["admin", "editor"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const {
      title,
      categories,
      content,
      images,
      announcementImages,
      links,
      videoEmbeds,
      userName,
      userImage,
      createdAt,
    } = data;

    // Validation เบื้องต้น
    if (!title || !categories || !content) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const newNews = {
      title,
      slug: `${generateSlug(title)}-${Date.now()}`,
      categories,
      category: categories[0],
      content,
      images: images || [],
      announcementImages: announcementImages || [],
      links: links || [],
      videoEmbeds: videoEmbeds || [],

      // ✅ บันทึกชื่อคนโพสต์ที่ส่งมาจากหน้า Add News
      author: {
        // ใช้ข้อมูลจาก session เป็นหลัก เพื่อป้องกันปลอมตัวจากฝั่ง client
        id: (session.user as any).id || null,
        username: (session.user as any).username || null,
        name: session.user.name || userName || "งานศูนย์ข้อมูล",
        email: session.user.email || null,
        image: session.user.image || userImage || null,
      },
      authorId: (session.user as any).id || null,
      authorEmail: session.user.email || null,

      createdAt: createdAt ? new Date(createdAt) : new Date(),
      updatedAt: new Date(),
      status: "published",
      views: 0,
    };

    const result = await db.collection("news").insertOne(newNews);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- GET: ดึงรายการข่าว ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "15");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        title: 1,
        slug: 1,
        categories: 1,
        images: 1,
        announcementImages: 1,
        createdAt: 1,
        author: 1,
      })
      .toArray();

    const total = await db.collection("news").countDocuments();

    return NextResponse.json({ news, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
