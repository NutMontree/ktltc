import GeneralMemo, { connectDB } from "@/app/models/GeneralMemo";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const memo = await GeneralMemo.findOne({ _id: id });
    if (!memo) {
      return NextResponse.json({ message: "General Memo not found" }, { status: 404 });
    }
    return NextResponse.json({ memo }, { status: 200 });
  } catch (err) {
    console.error("GeneralMemo GET ID error:", err);
    return NextResponse.json({ message: "Error fetching General Memo", error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    // Check authorization
    const existingMemo = await GeneralMemo.findById(id);
    if (!existingMemo) {
      return NextResponse.json({ message: "General Memo not found" }, { status: 404 });
    }

    const session = await auth();
    const adminRoles = ["super_admin"];
    const isAdmin = session?.user?.role && adminRoles.includes(session.user.role.toLowerCase());
    const isOwner = session?.user?.id && existingMemo.userId === session.user.id;
    
    if (!isOwner && !isAdmin && existingMemo.userId) {
      return NextResponse.json({ message: "Unauthorized: You don't have permission to edit this document" }, { status: 403 });
    }

    const data = await req.json();

    const memo = await GeneralMemo.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ message: "General Memo updated", memo }, { status: 200 });
  } catch (err) {
    console.error("GeneralMemo PUT error:", err);
    return NextResponse.json({ message: "Error updating General Memo", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    // Check authorization
    const existingMemo = await GeneralMemo.findById(id);
    if (!existingMemo) {
      return NextResponse.json({ message: "General Memo not found" }, { status: 404 });
    }

    const session = await auth();
    const adminRoles = ["super_admin"];
    const isAdmin = session?.user?.role && adminRoles.includes(session.user.role.toLowerCase());
    const isOwner = session?.user?.id && existingMemo.userId === session.user.id;
    
    if (!isOwner && !isAdmin && existingMemo.userId) {
      return NextResponse.json({ message: "Unauthorized: You don't have permission to delete this document" }, { status: 403 });
    }

    await GeneralMemo.findByIdAndDelete(id);
    return NextResponse.json({ message: "General Memo deleted" }, { status: 200 });
  } catch (err) {
    console.error("GeneralMemo DELETE error:", err);
    return NextResponse.json({ message: "Error deleting General Memo", error: err.message }, { status: 500 });
  }
}
