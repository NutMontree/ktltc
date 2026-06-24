import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

/**
 * ฟังก์ชันช่วยบันทึก Log
 */
async function createLog(
  db: any,
  action: string,
  details: string,
  req: Request,
) {
  try {
    const session = await auth();
    await db.collection("logs").insertOne({
      userName: session?.user?.name || "Admin",
      action,
      details,
      module: "POSTERS",
      link: "/dashboard/posters",
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // สร้าง bulk operations เพื่ออัปเดต orderIndex แบบ batch
    const bulkOps = items.map((item: { _id: string; orderIndex: number }) => ({
      updateOne: {
        filter: { _id: new ObjectId(item._id) },
        update: { $set: { orderIndex: item.orderIndex, updatedAt: new Date() } },
      },
    }));

    if (bulkOps.length > 0) {
      await db.collection("posters").bulkWrite(bulkOps);
      
      // บันทึก Log
      await createLog(
        db,
        "REORDER_POSTERS",
        `ปรับลำดับโปสเตอร์จำนวน ${items.length} รายการ`,
        req,
      );
    }

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder posters" }, { status: 500 });
  }
}
