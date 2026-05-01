import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteFileFromUrl } from "@/lib/file-utils";

function getAuthorId(news: any): string {
  if (!news || typeof news !== "object") return "";
  if (typeof news.authorId === "string") return news.authorId;
  if (news.author && typeof news.author === "object") {
    if (typeof news.author.id === "string") return news.author.id;
  }
  return "";
}

function getLegacyAuthorName(news: any): string {
  if (!news || typeof news !== "object") return "";
  if (news.author && typeof news.author === "object") {
    return news.author.name?.name || news.author.name || "";
  }
  if (typeof news.author === "string") return news.author;
  return "";
}

function isLegacyOwner(news: any, session: any): boolean {
  const sessionName = session?.user?.name || "";
  const sessionEmail = session?.user?.email || "";
  const legacyAuthorName = getLegacyAuthorName(news);
  const legacyAuthorEmail =
    (news?.author && typeof news.author === "object" ? news.author.email : "") ||
    news?.authorEmail ||
    "";

  return (
    (Boolean(legacyAuthorName) && sessionName === legacyAuthorName) ||
    (Boolean(legacyAuthorEmail) && sessionEmail === legacyAuthorEmail)
  );
}

// --- GET: ดึงข้อมูลรายตัว (ทุกคนดูได้) ---
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });

    if (!news) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// --- PUT: แก้ไขข้อมูล (เช็คสิทธิ์เจ้าของ) ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const existingNews = await db
      .collection("news")
      .findOne({ _id: new ObjectId(id) });

    if (!existingNews) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }

    // --- ตรวจสอบสิทธิ์แก้ไข ---
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // สิทธิ์การแก้ไข: เจ้าของโพสต์ หรือ super_admin
    const ownerId = getAuthorId(existingNews);
    const isOwner =
      (Boolean(ownerId) && Boolean(userId) && ownerId === userId) ||
      (!ownerId && isLegacyOwner(existingNews, session));
    const isSuperAdmin = userRole === "super_admin";

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์แก้ไขโพสต์ของผู้อื่น" },
        { status: 403 },
      );
    }

    const {
      title,
      categories,
      content,
      images,
      announcementImages,
      links,
      videoEmbeds,
      createdAt,
    } = body;

    await db.collection("news").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          categories,
          category: categories?.[0] || "ทั่วไป",
          content,
          images: images || [],
          announcementImages: announcementImages || [],
          links: links || [],
          videoEmbeds: videoEmbeds || [],
          ...(createdAt && { createdAt: new Date(createdAt) }),
          updatedAt: new Date(),
        },
      },
    );

    // --- ลบไฟล์รูปภาพที่ถูกนำออกจากการแก้ไข ---
    const oldImages = [
      ...(existingNews.images || []),
      ...(existingNews.announcementImages || []),
    ];
    const newImages = [...(images || []), ...(announcementImages || [])];

    const imagesToDelete = oldImages.filter((img) => !newImages.includes(img));
    for (const imageUrl of imagesToDelete) {
      await deleteFileFromUrl(imageUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "แก้ไขล้มเหลว" }, { status: 500 });
  }
}

// --- DELETE: ลบข่าว (เช็คสิทธิ์เจ้าของ) ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    // 1. เช็คการล็อกอิน
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 2. ค้นหาข่าวเพื่อเช็คเจ้าของ
    const existingNews = await db
      .collection("news")
      .findOne({ _id: new ObjectId(id) });

    if (!existingNews) {
      return NextResponse.json({ error: "ไม่พบข้อมูลข่าว" }, { status: 404 });
    }

    // --- 3. ส่วนตรวจสอบสิทธิ์ (Logic ปรับปรุงใหม่) ---
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const ownerId = getAuthorId(existingNews);
    const isOwner =
      (Boolean(ownerId) && Boolean(userId) && ownerId === userId) ||
      (!ownerId && isLegacyOwner(existingNews, session));
    const isSuperAdmin = userRole === "super_admin";

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ลบโพสต์ของผู้อื่น" },
        { status: 403 },
      );
    }

    // --- 4. ดำเนินการลบ ---
    const result = await db
      .collection("news")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      // --- ลบไฟล์รูปภาพออกจากเครื่อง Lenovo ---
      const imagesToDelete = [
        ...(existingNews.images || []),
        ...(existingNews.announcementImages || []),
      ];

      for (const imageUrl of imagesToDelete) {
        await deleteFileFromUrl(imageUrl);
      }

      return NextResponse.json({ message: "ลบสำเร็จ" });
    }

    return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 400 });
  } catch (error) {
    console.error("DELETE API Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}
