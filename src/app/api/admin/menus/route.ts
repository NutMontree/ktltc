import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Get all custom menus
    const menus = await db.collection("custom_menus").find({}).toArray();
    
    return NextResponse.json({ menus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();
    
    // Only super_admin or admin can create menus
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, href, icon, desc, workspace } = body;

    if (!title || !href || !workspace) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Generate a unique permissionKey based on a timestamp and random string to avoid clashes
    const permissionKey = `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`;

    const newMenu = {
      title,
      href,
      icon: icon || "Layout",
      desc: desc || "",
      workspace,
      permissionKey,
      createdAt: new Date(),
    };

    const result = await db.collection("custom_menus").insertOne(newMenu);
    
    return NextResponse.json({ success: true, menu: { ...newMenu, _id: result.insertedId } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();
    
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Menu ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    await db.collection("custom_menus").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
