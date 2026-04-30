import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

function extractDataFromText(content: string) {
  try {
    // Basic regex extraction since it's just a JS variable
    const match = content.match(/export const Data = (\[[\s\S]*?\]);/);
    if (!match) return [];
    
    // Evaluate the array string safely-ish
    // Since this is trusted local code, we can use a Function constructor
    // to parse the JS object literal which JSON.parse can't handle because of backticks and unquoted keys
    const arrayStr = match[1];
    const parser = new Function(`return ${arrayStr}`);
    return parser();
  } catch (error) {
    console.error("Error parsing data.ts content:", error);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");
    
    const websiteDir = path.join(process.cwd(), "src", "app", "(website)");
    const departments = fs.readdirSync(websiteDir).filter(f => fs.statSync(path.join(websiteDir, f)).isDirectory());

    let totalMigrated = 0;
    const results = [];
    const defaultPassword = await bcrypt.hash("password123", 10);

    for (const dept of departments) {
      const dataFilePath = path.join(websiteDir, dept, "data.ts");
      if (!fs.existsSync(dataFilePath)) continue;

      const content = fs.readFileSync(dataFilePath, "utf8");
      const personnelList = extractDataFromText(content);

      for (const person of personnelList) {
        if (!person.name) continue;
        
        const cleanName = person.name.trim();

        const existingUser = await usersCollection.findOne({ name: cleanName });

        const updateDoc: { $set: any } = {
          $set: {
            position: person.position?.trim(),
            department: person.department?.trim(),
            faction: person.faction?.trim(),
            description: person.description?.trim(),
            isActive: true,
          }
        };

        // Only update image if the user doesn't already have a valid cloudinary image
        if (!existingUser?.image || !existingUser.image.includes('cloudinary')) {
             if(person.img && person.img.trim() !== '') {
                 updateDoc.$set.image = person.img.trim();
             }
        }

        if (existingUser) {
          await usersCollection.updateOne({ _id: existingUser._id }, updateDoc);
          results.push(`Updated existing: ${cleanName}`);
        } else {
          // Generate a fake email to satisfy unique constraint
          const fakeEmail = `fake_${Date.now()}_${Math.random().toString(36).substring(7)}@ktltc.ac.th`;
          // Insert new user
          await usersCollection.insertOne({
            name: cleanName,
            email: fakeEmail,
            username: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            password: defaultPassword,
            role: "teacher", 
            ...updateDoc.$set,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          results.push(`Inserted NEW: ${cleanName}`);
        }
        totalMigrated++;
      }
    }

    return NextResponse.json({ success: true, totalMigrated, results });
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
