import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");

    // Fetch all users
    const allUsers = await usersCollection.find({}).toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: allUsers.length,
      sample: allUsers.slice(0, 10).map(u => ({ name: u.name, email: u.email })),
      allEmails: allUsers.filter(u => u.email).map(u => u.email)
    });
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
