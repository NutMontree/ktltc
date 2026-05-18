import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Build query to find users matching name or username (case-insensitive)
    // and excluding the current logged-in user.
    let userObjectId: any = userId;
    try {
      if (ObjectId.isValid(userId)) {
        userObjectId = new ObjectId(userId);
      }
    } catch (_) {}

    const searchFilter: any = {
      _id: { $ne: userObjectId }
    };

    if (query.trim()) {
      const matchConditions: any[] = [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } }
      ];
      try {
        if (ObjectId.isValid(query)) {
          matchConditions.push({ _id: new ObjectId(query) });
        }
      } catch (_) {}
      searchFilter.$or = matchConditions;
    }

    const users = await db
      .collection("users")
      .find(searchFilter)
      .project({
        _id: 1,
        name: 1,
        username: 1,
        image: 1,
        role: 1,
        department: 1,
      })
      .limit(30)
      .toArray();

    // Convert ObjectIds to strings to ensure clean JSON responses
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error("Fetch chat users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
