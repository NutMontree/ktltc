import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// 1. ดึงโพสต์ (รองรับการกรองตาม userId หรือ authorId และตรวจสอบสถานะความเป็นส่วนตัว)
export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = (session?.user as any)?.id;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const authorId = searchParams.get("authorId");

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    let query: any = {};
    
    if (userId) {
      // ตรวจสอบว่าเป็นเพื่อนกันหรือไม่
      let isFriend = false;
      const isMe = currentUserId === userId;
      
      if (currentUserId && !isMe) {
        const currentUser = await db.collection("users").findOne({ _id: new ObjectId(currentUserId) });
        if (currentUser?.friends?.map((f: any) => String(f)).includes(userId)) {
          isFriend = true;
        }
      }

      query = {
        $and: [
          {
            $or: [
              { userId: new ObjectId(userId) },
              { authorId: new ObjectId(userId) }
            ]
          },
          {
            $or: [
              { audience: "public" },
              { audience: { $exists: false } }, // สำหรับโพสต์เก่าที่ไม่มี audience
              { authorId: currentUserId ? new ObjectId(currentUserId) : null }, // ผู้โพสต์เห็นเองเสมอ
              ...(isMe ? [{ audience: { $in: ["friends", "private"] } }] : []), // เจ้าของวอลล์เห็นโพสต์ตัวเอง
              ...(isFriend ? [{ audience: "friends" }] : []) // เพื่อนเห็นโพสต์ที่เป็น friends
            ]
          }
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
    const { title, content, image, images, targetUserId, audience } = body;
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // บันทึกข้อมูลโพสต์ลง Collection posts
    const newPost = {
      userId: targetUserId ? new ObjectId(targetUserId) : new ObjectId(userId), // วอลล์ที่เป็นเจ้าของ
      authorId: new ObjectId(userId), // ผู้โพสต์
      authorName: userName,
      authorImage: session?.user?.image,
      title,
      content,
      image, 
      images: images || (image ? [image] : []),
      audience: audience || "public", // ค่าเริ่มต้นเป็นสาธารณะ
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);

    // ✅ บันทึก Log กิจกรรม
    await db.collection("logs").insertOne({
      userId: new ObjectId(userId),
      userName: userName || "User",
      action: "CREATE_POST",
      details: `สร้างโพสต์ใหม่: ${content?.slice(0, 50)}... (ความเป็นส่วนตัว: ${audience || 'public'})`,
      targetId: result.insertedId,
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
