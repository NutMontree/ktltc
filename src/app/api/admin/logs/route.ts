import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAll = searchParams.get("all") === "true";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let logsQuery = db
      .collection("logs")
      .find({})
      .sort({ timestamp: -1 });

    if (!isAll) {
      logsQuery = logsQuery.limit(50);
    }

    const logs = await logsQuery.toArray();

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  console.log("LOG_POST: Request received");
  try {
    console.log("LOG_POST: Calling auth()...");
    const session = await auth();
    console.log("LOG_POST: auth() finished. Session:", session ? "Exists" : "Null");
    
    let body: any = {};
    
    try {
      body = await req.json();
      console.log("LOG_POST: Body parsed. Action:", body.action);
    } catch (e) {
      // If body is missing or invalid, we still want to log that something happened
      console.warn("LOG_POST: Missing or invalid body");
    }

    const { action, details, link, userName: manualName } = body;

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newLog = {
      userName: (session?.user as any)?.name || manualName || "SYSTEM_KERN",
      userEmail: session?.user?.email || null,
      action: action || "SYSTEM_ACTIVITY",
      details: details || "No specific details provided",
      link: link || null,
      timestamp: new Date(),
      ip,
      role: (session?.user as any)?.role || "guest",
    };

    await db.collection("logs").insertOne(newLog);
    console.log("LOG_POST: Log inserted successfully");

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("LOG_POST_ERROR_CRITICAL:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json({ error: "Internal Server Error during logging" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("logs").deleteMany({});

    await db.collection("logs").insertOne({
      userName: session.user?.name,
      action: "WIPE_ALL_LOGS",
      details: "ล้างประวัติกิจกรรมทั้งหมดโดย Super Admin",
      timestamp: new Date(),
      ip: "INTERNAL",
    });

    return NextResponse.json({ success: true, message: "Logs cleared" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 },
    );
  }
}
