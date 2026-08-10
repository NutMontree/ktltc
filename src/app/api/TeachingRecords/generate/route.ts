import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import axios from "axios";
import https from "https";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseName, unitName, topic, isTheory, isPractice } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ระบบยังไม่ได้ตั้งค่า GEMINI_API_KEY กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 500 }
      );
    }

    const promptText = `
คุณคือผู้เชี่ยวชาญด้านการจัดทำแผนการจัดการเรียนรู้ของวิทยาลัยเทคนิคกันทรลักษ์ หน้าที่ของคุณคือการช่วยคุณครูเขียนรายละเอียดการสอน โดยอิงจากข้อมูลเบื้องต้นที่คุณครูระบุมาดังนี้:

- วิชาที่สอน: "${courseName || "ไม่ระบุ"}"
- ชื่อหน่วยการเรียนรู้: "${unitName || "ไม่ระบุ"}"
- เรื่องที่สอน: "${topic || "ไม่ระบุ"}"
- รูปแบบการสอน: ${isTheory ? "ทฤษฎี " : ""}${isPractice ? "ปฏิบัติ " : ""}

กรุณาเขียนเนื้อหาแบบ **สรุปสั้นๆ กระชับ ได้ใจความ ไม่ต้องอธิบายยาว** โดยให้สอดคล้องกับเรื่องที่สอนอย่างสมจริง เป็นทางการ และนำไปใช้บันทึกหลังการสอนได้จริง ใน 3 ส่วนดังนี้:
1. กิจกรรมการเรียนการสอน (activities): สรุปขั้นตอนการสอนสั้นๆ เป็นข้อๆ หรือย่อหน้าสั้นๆ (ขั้นนำ, ขั้นสอน, ขั้นสรุป)
2. ผลการดำเนินกิจกรรมการเรียนการสอน (results): สรุปผลที่ได้สั้นๆ ว่าผู้เรียนได้ความรู้อะไร หรือผลการปฏิบัติเป็นอย่างไร
3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา (problems): ระบุปัญหาและวิธีแก้แบบสั้นๆ (ถ้าไม่มีปัญหาให้ตอบสั้นๆ ว่าราบรื่นและให้ความร่วมมือดี)

กรุณาส่งผลลัพธ์กลับมาเป็นรูปแบบ JSON เท่านั้น ห้ามตอบกลับเป็นข้อความธรรมดา รูปแบบ JSON คือ:
{
  "activities": "เนื้อหากิจกรรมการสอน...",
  "results": "เนื้อหาผลการสอน...",
  "problems": "เนื้อหาปัญหาและวิธีแก้ไข..."
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7,
      },
    };

    const httpsAgent = new https.Agent({ family: 4 });
    let data;
    try {
      const axiosResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
          httpsAgent,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      data = axiosResponse.data;
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError?.response?.data || apiError.message);
      return NextResponse.json(
        { error: "การสร้างเนื้อหาด้วย AI ล้มเหลว โปรดลองอีกครั้ง" },
        { status: 500 }
      );
    }

    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลจากการวิเคราะห์ของ AI" },
        { status: 500 }
      );
    }

    // Try parsing the text as JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(candidateText);
    } catch (e) {
      const jsonStr = candidateText.replace(/```json|```/g, "").trim();
      parsedResult = JSON.parse(jsonStr);
    }

    return NextResponse.json(parsedResult, { status: 200 });
  } catch (error) {
    console.error("Error in generate route:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
