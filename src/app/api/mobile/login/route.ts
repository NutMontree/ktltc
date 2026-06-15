import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const cleanUsername = username.trim();
    const user = await db.collection("users").findOne({ 
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } 
    });

    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: "User not found or invalid" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ success: false, message: "Account disabled" }, { status: 403 });
    }

    // Generate JWT for mobile
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback_secret_ktltc_mobile_app");
    const alg = "HS256";

    const token = await new SignJWT({ 
        id: user._id.toString(), 
        username: user.username, 
        role: user.role 
      })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("30d") // 30 days expiration
      .sign(secret);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name || user.username,
        role: user.role,
        image: user.image || ""
      }
    });

  } catch (error) {
    console.error("Mobile Login Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
