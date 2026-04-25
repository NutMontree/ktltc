import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// 1. ดึงโพสต์ (รองรับการกรองตาม userId หรือ authorId)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const authorId = searchParams.get("authorId");

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    let query = {};
    if (userId) {
      // ค้นหาทั้งโพสต์ที่เป็นเจ้าของวอลล์ หรือโพสต์ที่เขียนเองบนวอลล์นี้
      query = { 
        $or: [
          { userId: new ObjectId(userId) },
          { authorId: new ObjectId(userId) }
        ]
      };
    } else if (authorId) {
      query = { authorId: new ObjectId(authorId) };
    }

    const posts = await db
      .collection("posts")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// 2. สร้างโพสต์ใหม่ (และบันทึก Log ผู้ใช้)
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const userName = session?.user?.name;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, image, images, targetUserId } = body;
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // บันทึกข้อมูลโพสต์ลง Collection posts
    const newPost = {
      userId: targetUserId ? new ObjectId(targetUserId) : new ObjectId(userId), // วอลล์ที่เป็นเจ้าของ
      authorId: new ObjectId(userId), // ผู้โพสต์
      author: userName,
      title,
      content,
      image, // สำหรับรองรับข้อมูลเก่า
      images: images || (image ? [image] : []), // รองรับหลายรูป
      createdAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);

    // ✅ ส่วนสำคัญ: บันทึก Log กิจกรรมเพื่อให้ไปโชว์ในหน้า Admin
    await db.collection("logs").insertOne({
      userId: new ObjectId(userId), // ID ของผู้ใช้งานที่โพสต์
      userName: userName || "User", // ชื่อผู้ใช้งาน
      action: "CREATE_POST", // ประเภทกิจกรรม
      details: `สร้างโพสต์ใหม่หัวข้อ: ${title}`, // รายละเอียด/route.ts]
      targetId: result.insertedId, // ID ของโพสต์ที่ถูกสร้าง
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, postId: result.insertedId });
  } catch (error) {
    console.error("Create Post Error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
