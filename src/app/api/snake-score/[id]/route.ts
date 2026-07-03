import { NextResponse } from "next/server";
import { connectDB } from "@/models/TypingScore";
import { SnakeScore } from "@/models/SnakeScore";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    // เช็คสิทธิ์ว่าเป็น Super Admin หรือไม่
    if (!session || !session.user || (session.user as any).role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    await connectDB();
    const deletedScore = await SnakeScore.findByIdAndDelete(id);

    if (!deletedScore) {
      return NextResponse.json(
        { success: false, message: "Score not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Score deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE SnakeScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
