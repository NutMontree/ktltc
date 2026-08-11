import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // We do not return the actual key, just whether it exists
    const hasKey = !!user.geminiApiKey;

    return NextResponse.json({ hasKey }, { status: 200 });
  } catch (error) {
    console.error("Error in GET apikey:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await req.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let encryptedKey = "";
    if (apiKey && apiKey.trim() !== "") {
      encryptedKey = encrypt(apiKey.trim());
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { geminiApiKey: encryptedKey, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST apikey:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
