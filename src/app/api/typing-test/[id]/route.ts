import { NextResponse } from "next/server";
import TypingScore, { connectDB } from "@/models/TypingScore";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check if user is super_admin
    // NextAuth session typically has user.role or user.role in session
    const role = (session?.user as any)?.role || (session as any)?.role;
    
    if (!session || role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Super Admin only." },
        { status: 403 }
      );
    }

    await connectDB();
    const resolvedParams = await params;
    const deletedScore = await TypingScore.findByIdAndDelete(resolvedParams.id);

    if (!deletedScore) {
      return NextResponse.json(
        { success: false, message: "Score not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Score deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE TypingScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role || (session as any)?.role;

    if (!session || role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Super Admin only." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { wpm, accuracy } = body;

    await connectDB();
    const resolvedParams = await params;
    
    const updatedScore = await TypingScore.findByIdAndUpdate(
      resolvedParams.id,
      { wpm, accuracy },
      { new: true }
    );

    if (!updatedScore) {
      return NextResponse.json(
        { success: false, message: "Score not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Score updated successfully", score: updatedScore },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT TypingScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
