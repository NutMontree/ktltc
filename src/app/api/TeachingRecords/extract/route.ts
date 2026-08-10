import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const teacherUnitName = formData.get("unitName") as string;
    const teacherTopic = formData.get("topic") as string;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ระบบยังไม่ได้ตั้งค่า GEMINI_API_KEY กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 500 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG) หรือ PDF เท่านั้น" },
        { status: 415 }
      );
    }

    // Limit to 5MB to avoid base64 payload issues
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ไฟล์มีขนาดใหญ่เกินไป (จำกัด 5MB)" },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // ถ้าระบุชื่อหน่วยหรือเรื่องมา ให้เน้นย้ำ AI ให้ใช้ข้อมูลนี้
    const contextText = (teacherUnitName || teacherTopic) ? 
      `\n\n📌 **ข้อกำหนดสำคัญ**: ครูผู้สอนได้กำหนดหัวข้อมาแล้วดังนี้
- ชื่อหน่วย: "${teacherUnitName || "ไม่ระบุ"}"
- เรื่องที่สอน: "${teacherTopic || "ไม่ระบุ"}"
👉 ให้ AI ใช้ชื่อหน่วยและเรื่องตามที่ครูกำหนดนี้เป็นหลัก และ **ต้องแต่งกิจกรรม (activities), ผลการสอน (results) และปัญหา (problems) ให้สอดคล้องกับหัวข้อนี้เท่านั้น** ห้ามแต่งนอกเรื่อง!` : "";

const promptText = `
คุณคือผู้ช่วย AI ของวิทยาลัยเทคนิคกันทรลักษ์ มีหน้าที่ดึงข้อมูลและ **สร้างข้อมูลอธิบายเนื้อหาการสอน** จากเอกสารที่แนบมา (เช่น แผนการสอน หรือ ตารางสอน)${contextText}

กรุณาส่งกลับมาเป็นรูปแบบ JSON เท่านั้น โดยมี Key ดังนี้:
- semester (ภาคเรียน 1 ค่า)
- availableSemesters (Array ของภาคเรียนที่พบ หรือ [ "1", "2", "3" ])
- academicYear (ปีการศึกษา 1 ค่า)
- availableAcademicYears (Array ของปีการศึกษาที่พบ)
- courseCode (รหัสวิชา 1 ค่า)
- availableCourseCodes (Array ของรหัสวิชาทั้งหมดที่พบ)
- courseName (ชื่อวิชา 1 ค่า)
- availableCourseNames (Array ของชื่อวิชาทั้งหมดที่พบ)
- teachingNo (สอนครั้งที่ 1 ค่า)
- availableTeachingNos (Array ของเลขสอนครั้งที่ที่พบ หรือสร้างให้ 1-18)
- date (วันที่ 1 ค่า)
- availableDates (Array ของวันที่ทั้งหมดที่พบ)
- weekNo (สัปดาห์ที่ 1 ค่า)
- availableWeekNos (Array ของเลขสัปดาห์ที่พบ หรือสร้างให้ 1-18)
- unitNo (หน่วยการเรียนรู้ที่ 1 ค่า)
- availableUnitNos (Array ของเลขหน่วยที่พบ)
- unitName (ชื่อหน่วย 1 ค่า - ถ้าครูกำหนดมาให้ใช้ของครู)
- availableUnitNames (Array ของชื่อหน่วยทั้งหมดที่พบในเอกสาร)
- topic (เรื่อง 1 ค่า - ถ้าครูกำหนดมาให้ใช้ของครู)
- availableTopics (Array ของเรื่องทั้งหมดที่พบในเอกสาร)
- activities (กิจกรรมการเรียนการสอน - **สำคัญ: ถ้าไม่มีในเอกสาร ให้ AI แต่งขึ้นมาเอง** โดยเนื้อหากิจกรรม **ต้องสอดคล้องกับหัวข้อที่สอน**)
- isTheory (เป็นทฤษฎีหรือไม่ true/false)
- isPractice (เป็นปฏิบัติหรือไม่ true/false)
- results (ผลการดำเนินกิจกรรมการเรียนการสอน - **ให้แต่งขึ้นมาเองให้สอดคล้องกับเนื้อหาที่สอน**)
- problems (ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา - **ให้แต่งขึ้นมาเองให้สอดคล้องกับการเรียนการสอนเรื่องนั้นๆ**)
- signerName (ชื่อครูผู้สอน)
- headName (ชื่อหัวหน้าแผนก ถ้าไม่มีให้เป็น "นางกิ่งดาว บุญประสิทธิ์")

ย้ำ: หากผู้ใช้แนบมาแค่ตารางสอน หรือแผนแบบย่อที่ไม่มีรายละเอียด ให้ AI **จำลองข้อมูล (Generate)** ช่อง activities, results, problems ออกมาให้ครบถ้วน โดย **ต้องอิงตามเนื้อหาวิชาและเรื่องที่สอน (topic) อย่างตรงประเด็นที่สุด** ห้ามเว้นว่าง!
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการประมวลผล AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลจาก AI" },
        { status: 500 }
      );
    }

    try {
      const parsedData = JSON.parse(extractedText);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", extractedText);
      return NextResponse.json(
        { error: "รูปแบบข้อมูลที่ได้จาก AI ไม่ถูกต้อง" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
