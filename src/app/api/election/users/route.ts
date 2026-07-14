import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = String(session.user.role || "").toLowerCase().trim();
    if (!["super_admin", "admin", "director", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const users = await db.collection("users")
      .find({})
      .project({ name: 1, username: 1, image: 1, role: 1, department: 1, classGroupId: 1 })
      .sort({ role: 1, name: 1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
