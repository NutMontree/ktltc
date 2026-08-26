import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectMongoose } from '@/lib/mongoose';
import clientPromise from '@/lib/db';
import { ChatLog } from '@/models/ChatLog';
import { v4 as uuidv4 } from 'uuid';

// ฟังก์ชันจำลองการสกัดคีย์เวิร์ดภาษาไทยอย่างง่าย เพื่อเก็บเป็น Data ไว้เทรน AI
function extractKeywords(text: string): string[] {
  const stopWords = ['ครับ', 'ค่ะ', 'คือ', 'เป็น', 'ที่', 'มี', 'ให้', 'อยาก', 'ช่วย', 'หน่อย', 'อะไร'];
  const words = text.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
  return Array.from(new Set(words));
}

function determineIntent(text: string): string {
  if (text.includes("สมัคร") || text.includes("เรียน")) return "admission";
  if (text.includes("ติดต่อ") || text.includes("เบอร์")) return "contact";
  if (text.includes("ค่าเทอม") || text.includes("จ่าย")) return "tuition_fee";
  if (text.includes("ข่าว") || text.includes("ประกาศ") || text.includes("วันไหน")) return "news_query";
  return "general_query";
}

// ฟังก์ชันล้างคำถามภาษาไทยเพื่อเอาไปค้นหาในฐานข้อมูลให้แม่นยำขึ้น
function cleanThaiQuery(text: string): string {
  let cleaned = text.replace(/คือใคร|คืออะไร|ที่ไหน|วันไหน|เมื่อไหร่|ไหม|รึเปล่า|ครับ|ค่ะ|ช่วยบอก|หน่อย|ใคร/g, '');
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const { message, sessionId: reqSessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sessionId = reqSessionId || uuidv4();
    const keywords = extractKeywords(message);
    const intent = determineIntent(message);

    // ดึงประวัติแชตเก่า 6 ข้อความล่าสุด (ก่อนที่จะบันทึกข้อความปัจจุบัน) เพื่อเป็นความจำให้ AI
    let pastLogs: any[] = [];
    try {
      pastLogs = await ChatLog.find({ sessionId }).sort({ createdAt: -1 }).limit(6);
      pastLogs.reverse(); // เรียงจากเก่าไปใหม่
    } catch (err) {
      console.error("Fetch ChatLog Error:", err);
    }

    // บันทึกคำถามของ User พร้อมคีย์เวิร์ด เอาไว้เทรน AI ตัวเองในอนาคต
    ChatLog.create({
      sessionId,
      role: 'user',
      content: message,
      keywords, 
      intent,
    }).catch(err => console.error("DB User Log Error:", err));

    // --- RAG (Retrieval-Augmented Generation) Logic ---
    let newsContext = "";
    try {
      const client = await clientPromise;
      const db = client.db("ktltc_db");
      const kbCollection = db.collection("ai_knowledge_base");
      
      let query = {};
      const cleanMsg = cleanThaiQuery(message);
      
      // ใช้ $text search บนห้องสมุด AI
      if (cleanMsg) {
        query = { $text: { $search: cleanMsg } };
      }
      
      // ดึงข้อมูล 3 ชิ้นที่ตรงกับคำถามมากที่สุด เรียงตามคะแนนความแม่นยำ (Text Score)
      const kbResults = await kbCollection
        .find(query, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(3)
        .toArray();
      
      // ถ้าหาแบบ Text Search ไม่เจอ (เช่น คำถามกว้างไป) ให้ใช้วิธีหาแบบ Regex
      let finalResults = kbResults;
      if (finalResults.length === 0 && keywords.length > 0) {
        const regexQuery = {
          $or: keywords.map(kw => ({
            $or: [
              { title: { $regex: kw, $options: 'i' } },
              { content: { $regex: kw, $options: 'i' } }
            ]
          }))
        };
        finalResults = await kbCollection.find(regexQuery).limit(3).toArray();
      }

      if (finalResults.length > 0) {
        newsContext = "ข้อมูลจากฐานข้อมูลของวิทยาลัย (ใช้ประกอบการตอบคำถาม):\n" + 
          finalResults.map((doc, i) => {
            return `ข้อมูลที่ ${i+1}. [${doc.type}] ${doc.title}\nรายละเอียด: ${doc.content}...`;
          }).join('\n\n');
      }
    } catch (err) {
      console.error("RAG KB Fetch Error:", err);
    }
    
    // ข้อมูลพื้นฐานที่ตายตัว (ป้องกัน AI มั่วข้อมูล)
    const staticContext = `
ข้อมูลผู้บริหารระดับสูง (ต้องจำไว้เสมอ ห้ามเดาเอาเอง):
- ผู้อำนวยการวิทยาลัย: นางสาวทักษิณา ชมจันทร์
- รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน: นายสมศักดิ์ จันทานิตย์
- รองผู้อำนวยการฝ่ายกิจการนักเรียน นักศึกษา: นางสาววิภาวรรณ สีแดด
- รองผู้อำนวยการฝ่ายบริหารทรัพยากร: นางสาวภวิกา โพธิ์ขาว
- รองผู้อำนวยการฝ่ายวิชาการ: นายอาทร ศรีมะณี
    `.trim();

    // ผสม Context เข้ากับ Prompt คำถามสุดท้าย
    const finalPrompt = `ตอบเป็นภาษาไทย สั้นๆ กระชับ เป็นมิตร เป็นผู้ช่วย AI ของวิทยาลัยเทคนิคกันทรลักษ์
ข้อห้ามสำคัญ: ห้ามใช้เครื่องหมาย ** ในการเน้นคำเด็ดขาด ให้ใช้เครื่องหมายอัญประกาศ (" ") แทนเท่านั้น

${staticContext}

${newsContext}

คำถามของนักเรียน: ${message}`;

    // สร้างชุดข้อมูลประวัติการคุย (Chat History) สำหรับ Gemini
    const chatHistory = pastLogs.map(log => ({
      role: log.role === 'user' ? 'user' : 'model',
      parts: [{ text: log.content }]
    }));
    
    // เอาคำถามปัจจุบันต่อท้ายประวัติ
    chatHistory.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });

    const geminiKey = process.env.GEMINI_API_KEY;

    let targetUrl = "";
    let fetchOptions: RequestInit = {};
    let isGemini = false;

    if (geminiKey && geminiKey.length > 10) {
      isGemini = true;
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${geminiKey}`;
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: chatHistory
        })
      };
    } else {
      targetUrl = "http://127.0.0.1:11434/api/generate";
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: finalPrompt, // Local Ollama fallback doesn't easily support full history arrays in `/api/generate` without parsing
          stream: true
        })
      };
    }

    const aiRes = await fetch(targetUrl, fetchOptions);

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI API Error:", errText);
      return new Response(`⚠️ AI ขัดข้อง: เชื่อมต่อไม่สำเร็จ`, { status: 200 });
    }

    // สร้าง Stream ดึงข้อมูลแบบ Real-time
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        const encoder = new TextEncoder();
        let fullResponse = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            
            // แยกบรรทัด เพราะบางทีมาหลาย events ติดกัน
            const lines = chunk.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              let textPart = "";

              if (isGemini) {
                // Gemini format: data: {...}
                if (trimmed.startsWith('data: ') && !trimmed.includes('[DONE]')) {
                  try {
                    const data = JSON.parse(trimmed.slice(6));
                    textPart = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  } catch (e) {}
                }
              } else {
                // Ollama format: {...} (NDJSON)
                try {
                  const data = JSON.parse(trimmed);
                  textPart = data.response || "";
                } catch (e) {}
              }

              if (textPart) {
                fullResponse += textPart;
                // พ่น Text เปล่าๆ ออกไปให้ Frontend เลย
                controller.enqueue(encoder.encode(textPart));
              }
            }
          }
          
          // เมื่อพ่นครบ ค่อยบันทึกลงฐานข้อมูลแบบเงียบๆ
          await ChatLog.create({
            sessionId,
            role: 'ai',
            content: fullResponse,
          });

        } catch (e) {
          console.error("Stream parsing error", e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("ระบบขัดข้องชั่วคราว", { status: 500 });
  }
}
