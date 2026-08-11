import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import axios from "axios";
import https from "https";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";

const MAX_RETRIES = 3;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

async function callGeminiWithKeys(
  keys: string[],
  requestBody: any,
  httpsAgent: https.Agent
) {
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      const res = await axios.post(
        `${GEMINI_URL}?key=${apiKey}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
          httpsAgent,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      return res.data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429 && i < keys.length - 1) {
        console.warn(`[Gemini] Rate limited on key ${i + 1}. Switching to fallback key...`);
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const isTheory = formData.get("isTheory") === "true";
    const isPractice = formData.get("isPractice") === "true";
    const courseName = formData.get("courseName") as string;
    const unitName = formData.get("unitName") as string;
    const topic = formData.get("topic") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });

    let keysToTry: string[] = [];
    if (user && user.geminiApiKey) {
      const decryptedKey = decrypt(user.geminiApiKey);
      if (decryptedKey) {
        keysToTry.push(decryptedKey);
      }
    }

    if (process.env.GEMINI_API_KEY && !keysToTry.includes(process.env.GEMINI_API_KEY)) {
      keysToTry.push(process.env.GEMINI_API_KEY);
    }

    if (keysToTry.length === 0) {
      return NextResponse.json(
        { error: "ระบบยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือกรุณาใส่ API Key ของตัวเอง" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const mimeType = file.type;

    const promptText = `
คุณคือผู้ช่วยดึงข้อมูลจากเอกสารแผนการสอนหรือตารางสอน (รูปภาพหรือ PDF) หน้าที่ของคุณคือดึงข้อมูลที่เกี่ยวข้องกับการสอนออกมา
กรุณาวิเคราะห์เอกสารและส่งผลลัพธ์กลับมาเป็นรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:

{
  "availableSemesters": ["ภาคเรียน (เช่น 1, 2, 3)"],
  "availableAcademicYears": ["ปีการศึกษา (เช่น 2567, 2568)"],
  "availableCourseCodes": ["รหัสวิชา"],
  "availableCourseNames": ["ชื่อวิชา"],
  "availableTeachingNos": ["สอนครั้งที่"],
  "availableDates": ["วันที่สอน (ถ้ามี)"],
  "availableWeekNos": ["สัปดาห์ที่"],
  "availableUnitNos": ["หน่วยที่"],
  "availableUnitNames": ["ชื่อหน่วย"],
  "availableTopics": ["เรื่อง/หัวข้อย่อย"]
}

หมายเหตุ:
- ถ้าพบหลายตัวเลือก (เช่น มีหลายบท/หลายสัปดาห์) ให้ใส่ตัวเลือกทั้งหมดลงใน array ได้
- ถ้าข้อมูลใดไม่พบในเอกสาร ให้เว้นว่างเป็น array ว่าง []
- ห้ามตอบกลับเป็นข้อความธรรมดา ให้ตอบกลับเป็น JSON ที่ถูกต้องเท่านั้น
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2,
      },
    };

    const httpsAgent = new https.Agent({ family: 4 });
    let data;
    try {
      data = await callGeminiWithKeys(keysToTry, requestBody, httpsAgent);
    } catch (apiError: any) {
      const errData = apiError?.response?.data || apiError.message;
      console.error("Gemini API Error:", errData);
      const isRateLimit = apiError?.response?.status === 429;
      return NextResponse.json(
        {
          error: isRateLimit
            ? "ระบบ AI มีผู้ใช้งานเยอะ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง"
            : "การวิเคราะห์ด้วย AI ล้มเหลว โปรดลองอีกครั้ง",
        },
        { status: isRateLimit ? 429 : 500 }
      );
    }

    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลจากการวิเคราะห์ของ AI" },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(candidateText);
    } catch (e) {
      const jsonStr = candidateText.replace(/```json|```/g, "").trim();
      parsedResult = JSON.parse(jsonStr);
    }

    // Save to cache
    const courseCodeName = parsedResult.availableCourseCodes?.[0] || parsedResult.availableCourseNames?.[0] || file.name;
    const documentName = courseCodeName !== file.name ? `${courseCodeName} (${file.name})` : file.name;
    
    await db.collection("extracted_cache").insertOne({
      userId: session.user.id,
      documentName,
      data: parsedResult,
      createdAt: new Date(),
    });

    return NextResponse.json({ data: parsedResult }, { status: 200 });
  } catch (error) {
    console.error("Error in extract route:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

