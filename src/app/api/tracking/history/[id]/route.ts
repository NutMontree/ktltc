import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Edit individual history record
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    if (userRole !== "super_admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin only." }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
    }

    const { scannedOutAt, scannedInAt } = await request.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const updateData: any = {};
    if (scannedOutAt) updateData.scannedOutAt = new Date(scannedOutAt);
    if (scannedInAt) {
      updateData.scannedInAt = new Date(scannedInAt);
      updateData.status = "COMPLETED"; // If setting scan in time, force complete
      
      // Calculate duration
      if (updateData.scannedOutAt || scannedOutAt) {
         const outTime = updateData.scannedOutAt ? updateData.scannedOutAt.getTime() : new Date(scannedOutAt).getTime();
         const inTime = updateData.scannedInAt.getTime();
         updateData.durationMinutes = Math.floor((inTime - outTime) / 60000);
      }
    } else if (scannedInAt === null) {
      updateData.scannedInAt = null;
      updateData.status = "ACTIVE";
      updateData.durationMinutes = null;
    }

    const result = await db.collection("off_campus_sessions").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Record updated successfully" });
  } catch (error) {
    console.error("Edit History Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Delete individual history record
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    if (userRole !== "super_admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin only." }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("off_campus_sessions").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete History Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
