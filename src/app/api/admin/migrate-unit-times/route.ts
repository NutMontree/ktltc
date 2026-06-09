import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { auth } from "@/auth";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "ktltc";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = new MongoClient(uri!);
    await client.connect();

    const db = client.db(dbName);
    const unitsCollection = db.collection("dve_units");

    const units = await unitsCollection.find({}).toArray();
    console.log(`Found ${units.length} units`);

    let updatedCount = 0;

    for (const unit of units) {
      const updates: any = {};
      let needsUpdate = false;

      if (typeof unit.studyMinutes === "string") {
        const numValue = Number(unit.studyMinutes);
        if (!isNaN(numValue)) {
          updates.studyMinutes = numValue;
          needsUpdate = true;
        }
      }

      if (typeof unit.totalMinutes === "string") {
        const numValue = Number(unit.totalMinutes);
        if (!isNaN(numValue)) {
          updates.totalMinutes = numValue;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await unitsCollection.updateOne(
          { _id: unit._id },
          { $set: updates }
        );
        updatedCount++;
      }
    }

    await client.close();

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} units`,
      updatedCount,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
