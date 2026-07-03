import { NextResponse } from "next/server";
import TypingScore, { connectDB } from "@/models/TypingScore";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "th";

    await connectDB();
    
    // สำหรับภาษาไทย ให้นับรวมสถิติเก่าที่ยังไม่มีฟิลด์ language ด้วย
    const query = lang === "th" 
      ? { $or: [{ language: "th" }, { language: { $exists: false } }] }
      : { language: lang };

    // Get Top 10 High Scores
    const topScores = await TypingScore.find(query)
      .sort({ wpm: -1, accuracy: -1, createdAt: 1 })
      .limit(10)
      .lean();
    return NextResponse.json({ success: true, topScores }, { status: 200 });
  } catch (error) {
    console.error("GET TypingScore Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to save score." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { wpm, accuracy, lang } = body;
    const language = lang || "th";

    if (wpm === undefined || accuracy === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: wpm, accuracy" },
        { status: 400 },
      );
    }

    await connectDB();

    const userId = session.user.id || session.user.name;
    const userImage = session.user.image || "";

    // ค้นหาประวัติเดิมของผู้ใช้ (แยกตามภาษา) และพิจารณาให้คะแนนที่ไม่มีฟิลด์ language ถือว่าเป็นภาษาไทย
    const query = language === "th"
      ? { userId, $or: [{ language: "th" }, { language: { $exists: false } }] }
      : { userId, language };
      
    const existingScore = await TypingScore.findOne(query);

    if (existingScore) {
      // ถ้ามีประวัติเดิม ให้เทียบ WPM ว่าเยอะกว่าเดิมไหม
      if (
        wpm > existingScore.wpm ||
        (wpm === existingScore.wpm && accuracy > existingScore.accuracy)
      ) {
        existingScore.wpm = wpm;
        existingScore.accuracy = accuracy;
        existingScore.name = session.user.name || "Unknown User"; // Update name just in case
        existingScore.userImage = userImage;
        existingScore.createdAt = new Date();
        await existingScore.save();
        return NextResponse.json(
          { success: true, message: "New high score updated!", score: existingScore },
          { status: 200 },
        );
      } else {
        // อัปเดต userImage เผื่อเปลี่ยนรูปโปรไฟล์ แต่คะแนนเท่าเดิม
        existingScore.userImage = userImage;
        await existingScore.save();

        return NextResponse.json(
          {
            success: true,
            message: "Score did not beat previous high score",
            score: existingScore,
          },
          { status: 200 },
        );
      }
    } else {
      // ถ้ายังไม่มีประวัติให้สร้างใหม่
      const newScore = new TypingScore({
        userId,
        name: session.user.name || "Unknown User",
        userImage,
        language,
        wpm,
        accuracy,
      });
      await newScore.save();
      return NextResponse.json(
        { success: true, message: "Score saved successfully", score: newScore },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("POST TypingScore Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
