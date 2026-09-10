import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

// Extract [CODE_PROPOSAL] block if M1 proposes a code modification
function extractCodeProposal(text: string): { proposal: any | null; cleanedText: string } {
  const match = text.match(/\[CODE_PROPOSAL\]([\s\S]*?)\[\/CODE_PROPOSAL\]/i);
  if (!match) return { proposal: null, cleanedText: text };

  try {
    const rawJson = match[1].trim();
    const cleanedJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanedJson);
    const isValid =
      parsed.filePath &&
      (parsed.code !== undefined ||
        (parsed.action === "patch" && parsed.target !== undefined && parsed.replacement !== undefined));
    if (isValid) {
      const cleanedText = text.replace(match[0], "").trim();
      return { proposal: parsed, cleanedText };
    }
  } catch (err) {
    console.warn("Failed to parse CODE_PROPOSAL JSON:", err);
  }
  return { proposal: null, cleanedText: text };
}

async function quickPing(ip: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`ping -c 1 -W 1 ${ip}`);
    const timeMatch = stdout.match(/time=([0-9.]+)\s*ms/);
    return timeMatch ? `ONLINE (Latency: ${timeMatch[1]} ms)` : "ONLINE";
  } catch {
    return "OFFLINE / UNREACHABLE";
  }
}

// Simple keyword extractor for searching M1 knowledge base
function extractSearchTerms(text: string): string[] {
  const clean = text.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, " ");
  return clean
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8);
}

// Autonomous Cognitive Brain Extractor: Analyzes conversation and distills new facts automatically
async function extractAutonomousKnowledge(userMsg: string, aiReply: string, db: any) {
  if (userMsg.trim().length < 10) return null;

  const extractionPrompt = `คุณคือ Cognitive Brain Engine ประจำตัว AI ชื่อ M1 วิทยาลัยเทคนิคกันทรลักษ์
วิเคราะห์บทสนทนานี้เพื่อสกัด "ข้อเท็จจริงใหม่, การแก้ปัญหาทางเทคนิค, การตั้งค่าเครือข่าย/เซิร์ฟเวอร์, ความรู้เชิงวิศวกรรม, หรือข้อมูลสำคัญ" ที่ Super Admin บอก หรือที่ M1 และผู้ใช้ได้ข้อสรุปร่วมกัน:
User: "${userMsg}"
M1: "${aiReply.slice(0, 500)}"

คำสั่งสำคัญ:
1. หากเป็นแค่การทักทาย, คำถามทั่วไปที่ไม่มีการระบุข้อมูลใหม่, หรือคำถามทดสอบทั่วไป ให้ตอบ: {"shouldLearn": false}
2. หากมีข้อมูลระบบ, การแก้ปัญหา, คำสั่งเทคนิค, ข้อมูลใหม่ของ KTLTC, การเขียนโปรแกรม หรือข้อเท็จจริงที่ควรจำ ให้สกัดเป็น JSON:
{
  "shouldLearn": true,
  "topic": "ชื่อหัวข้อองค์ความรู้ที่กระชับ ชัดเจน",
  "content": "เนื้อหาองค์ความรู้ที่กลั่นกรองและสรุปให้พร้อมนำไปประมวลผล",
  "tags": ["tag1", "tag2"],
  "category": "network" | "server" | "programming" | "engineering" | "ktltc" | "general"
}
ตอบเฉพาะ JSON เท่านั้น`;

  let jsonStr = "";
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: extractionPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(5000),
        }
      );
      if (geminiRes.ok) {
        const d = await geminiRes.json();
        jsonStr = d.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to Ollama if Gemini was unavailable
  if (!jsonStr) {
    try {
      const localRes = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "m1",
          prompt: extractionPrompt,
          format: "json",
          stream: false,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (localRes.ok) {
        const d = await localRes.json();
        jsonStr = d.response;
      }
    } catch {
      // ignore
    }
  }

  if (!jsonStr) return null;

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.shouldLearn || !parsed.topic || !parsed.content) return null;

    const kbCol = db.collection("m1_knowledge_base");
    const newLearned = {
      topic: parsed.topic.trim(),
      content: parsed.content.trim(),
      tags: Array.isArray(parsed.tags) ? parsed.tags : ["autonomous_learn"],
      category: parsed.category || "general",
      source: "autonomous_cognitive_extraction",
      confidence: 0.98,
      createdAt: new Date(),
    };

    // Upsert into knowledge base so M1 updates its knowledge when new info is received
    await kbCol.updateOne(
      { topic: newLearned.topic },
      { $set: newLearned },
      { upsert: true }
    );

    return newLearned;
  } catch {
    return null;
  }
}

// Live Web Search Engine for M1 (Real-Time Internet Retrieval)
async function searchWeb(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  try {
    const params = new URLSearchParams({ q: query });
    const res = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const results: Array<{ title: string; snippet: string; link: string }> = [];
    const regex =
      /<h2 class="result__title">[\s\S]*?<a class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>[\s\S]*?<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null && results.length < 4) {
      const rawLink = match[1];
      const link = decodeURIComponent(rawLink.replace(/.*uddg=/, "").split("&")[0]);
      const title = match[2].replace(/<[^>]*>/g, "").trim();
      const snippet = match[3].replace(/<[^>]*>/g, "").trim();
      if (title && snippet) {
        results.push({ title, snippet, link });
      }
    }
    return results;
  } catch (err) {
    console.warn("Web search error:", err);
    return [];
  }
}

function shouldSearchWeb(text: string): boolean {
  const triggers = [
    "ค้นหา",
    "เสิร์ช",
    "หาในเน็ต",
    "ล่าสุด",
    "วันนี้",
    "ราคา",
    "ข่าว",
    "อากาศ",
    "อัปเดต",
    "เวอร์ชัน",
    "คือใคร",
    "อยู่ที่ไหน",
    "google",
    "search",
    "เว็บ",
    "ข้อมูลนอก",
    "นายก",
    "ทองคำ",
    "ดอลลาร์",
    "หุ้น",
  ];
  return triggers.some((t) => text.toLowerCase().includes(t.toLowerCase()));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { message, history, useModel, attachments, sessionId } = await req.json();
    if (!message && (!Array.isArray(attachments) || attachments.length === 0)) {
      return NextResponse.json({ error: "Message or attachments are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const kbCol = db.collection("m1_knowledge_base");

    // 1. Retrieve Learned Knowledge from M1 Memory (RAG)
    let retrievedMemories = "";
    try {
      const searchTerms = extractSearchTerms(message);
      let query: any = {};

      if (searchTerms.length > 0) {
        query = {
          $or: searchTerms.map((term) => ({
            $or: [
              { topic: { $regex: term, $options: "i" } },
              { content: { $regex: term, $options: "i" } },
              { tags: { $regex: term, $options: "i" } },
            ],
          })),
        };
      }

      const memories = await kbCol.find(query).limit(6).toArray();
      if (memories.length > 0) {
        retrievedMemories =
          "=== องค์ความรู้และบทเรียนที่ M1 เคยเรียนรู้บันทึกไว้ในสมอง ===\n" +
          memories.map((m, i) => `${i + 1}. [${m.topic}]: ${m.content}`).join("\n") +
          "\n=======================================================\n";
      }
    } catch (e) {
      console.error("Failed to recall memories:", e);
    }

    // 2. Live Telemetry Check across all campus devices (NO MOCK DATA)
    const telemetrySnapshots = await Promise.all([
      quickPing("192.168.6.1").then((s) => `- HUAWEI USG6525E (192.168.6.1 / Server Room): ${s}`),
      quickPing("192.168.6.3").then((s) => `- Aruba 8320 Core Switch (192.168.6.3 / Server Room): ${s}`),
      quickPing("192.168.6.14").then((s) => `- HPE 1930 ตึกวิทยบริการ (192.168.6.14 / Port 1/1/1): ${s}`),
      quickPing("192.168.6.12").then((s) => `- HPE 1930 อาคารช่างกล (192.168.6.12 / Port 1/1/2): ${s}`),
      quickPing("192.168.6.15").then((s) => `- HPE 1930 ตึกสามัญ (192.168.6.15 / Port 1/1/3): ${s}`),
      quickPing("192.168.6.11").then((s) => `- HPE 1930 อาคารช่างเชื่อม (192.168.6.11 / Port 1/1/4): ${s}`),
      quickPing("192.168.6.13").then((s) => `- Switch อาคารช่างยนต์ (192.168.6.13 / Port 1/1/5): ${s}`),
      quickPing("192.168.6.17").then((s) => `- HPE 1930 อาคารอิเล็กทรอนิกส์ (192.168.6.17 / Port 1/1/6): ${s}`),
      quickPing("192.168.6.10").then((s) => `- HPE 1930 ตึกอำนวยการ (192.168.6.10 / Port 1/1/7): ${s}`),
      quickPing("192.168.6.210").then((s) => `- Cisco SG500 อาคาร 4 (192.168.6.210 / Port 1/1/8): ${s}`),
      quickPing("192.168.6.32").then((s) => `- Reyee ป้อมยาม (192.168.6.32 / Port 1/1/9): ${s}`),
      quickPing("192.168.6.31").then((s) => `- Reyee ตึกโดม (192.168.6.31 / Port 1/1/10): ${s}`),
      quickPing("192.168.6.35").then((s) => `- HPE 1930 บ้านพักครู (192.168.6.35 / Port 1/1/11): ${s}`),
      quickPing("202.29.224.34").then((s) => `- วงจร UNINET WAN (202.29.224.34): ${s}`),
      quickPing("122.154.155.45").then((s) => `- วงจร CAT NT WAN (122.154.155.45): ${s}`),
      quickPing("8.8.8.8").then((s) => `- Google DNS Internet Check (8.8.8.8): ${s}`),
    ]);

    const liveTelemetryReport = `
=== สถานะอุปกรณ์เครือข่ายและวงจรสดทั้งวิทยาลัย (Campus-Wide Live Telemetry Snapshot) ===
${telemetrySnapshots.join("\n")}
======================================================================================
`.trim();

    // 3. Live Web Search Grounding (ค้นหาข้อมูลสดจากอินเทอร์เน็ต)
    let liveWebReport = "";
    let webResults: Array<{ title: string; snippet: string; link: string }> = [];
    if (shouldSearchWeb(message)) {
      try {
        webResults = await searchWeb(message);
        if (webResults.length > 0) {
          liveWebReport =
            "\n=== ข้อมูลสดจากการค้นหาอินเทอร์เน็ต (Live Web Search Results) ===\n" +
            webResults
              .map(
                (r, i) =>
                  `${i + 1}. [${r.title}]: ${r.snippet} (ที่มา: ${r.link})`
              )
              .join("\n") +
            "\n===================================================================\n";
        }
      } catch (err) {
        console.warn("Web search failed:", err);
      }
    }

    // 4. Source File Inspector (If user mentions a src/ file or page route)
    let inspectedFileContext = "";
    const realProjectRoot = process.cwd().includes(path.join(".next", "standalone"))
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

    let targetFilePath = "";
    const filePathMatch = message.match(/(?:src\/|\/)?([a-zA-Z0-9_\-\.\/]+?\.(?:tsx|ts|jsx|js|css|json))/);
    const routeMatch = message.match(/\/(dashboard[a-zA-Z0-9_\-\/]*|[a-zA-Z0-9_\-]+)/);

    if (filePathMatch) {
      const rawPath = filePathMatch[0];
      targetFilePath = rawPath.startsWith("src/") ? rawPath : `src/${rawPath.replace(/^\//, "")}`;
    } else if (routeMatch) {
      const routePath = routeMatch[1].replace(/\/$/, "");
      targetFilePath = `src/app/${routePath}/page.tsx`;
    }

    if (targetFilePath) {
      const candidatePaths = [
        targetFilePath,
        targetFilePath.replace(/^src\/app\//, "src/app/(website)/"),
        targetFilePath.replace(/^src\/app\//, "src/app/(admin)/"),
        targetFilePath.replace(/^src\/app\//, "src/app/(components)/"),
      ];

      for (const candidate of candidatePaths) {
        try {
          const fullPath = path.resolve(realProjectRoot, candidate);
          if (fullPath.startsWith(path.resolve(realProjectRoot, "src"))) {
            const content = await fs.readFile(fullPath, "utf-8");
            targetFilePath = candidate;
            inspectedFileContext = `
=== โค้ดปัจจุบันของไฟล์ ${candidate} (ดึงจากเครื่องเซิร์ฟเวอร์สด ห้ามลบโค้ดเดิมหรือเขียน mock แทนที่) ===
${content.slice(0, 16000)}
==================================================================
`;
            break;
          }
        } catch {
          // continue checking next candidate path
        }
      }
    }

    // 5. Attached Text/Logs/Config Files Context
    let attachmentContext = "";
    if (Array.isArray(attachments) && attachments.length > 0) {
      const textFiles = attachments.filter(
        (a: any) =>
          a.textContent ||
          a.type?.startsWith("text/") ||
          /\.(log|conf|cfg|txt|json|csv|md)$/i.test(a.name || "")
      );
      if (textFiles.length > 0) {
        attachmentContext =
          "\n=== ข้อมูลไฟล์เอกสาร/Config/Logs ที่ Super Admin แนบมา ===\n" +
          textFiles
            .map(
              (f: any, i: number) =>
                `[ไฟล์ที่ ${i + 1}: ${f.name}]\n${(f.textContent || "").slice(0, 10000)}`
            )
            .join("\n---\n") +
          "\n======================================================\n";
      }
    }

    const systemPrompt = `
คุณคือ "M1" สุดยอด Cognitive Agent และ AI ประจำเครื่องเซิร์ฟเวอร์ วิทยาลัยเทคนิคกันทรลักษ์ (KTLTC)
คุณไม่ใช่แค่คลังเก็บข้อมูล แต่คุณคือ "สมองประมวลผลและวิเคราะห์ข้อมูลเชิงลึก (Cognitive Processing Engine)"
คุณมีความสามารถในการค้นหาข้อมูลสดจากอินเทอร์เน็ตและนำมาประมวลผลตอบผู้ใช้ได้อย่างแม่นยำ
คุณมีความรู้รอบด้าน: การพัฒนาซอฟต์แวร์ (ทุกสายงาน), วิศวกรรมศาสตร์ (ทุกสาขา), ระบบเครือข่าย/ฮาร์ดแวร์, และความรู้รอบตัว

กระบวนการคิด การวิเคราะห์ และการประมวลผลของ M1 (4-Step Cognitive Architecture):
1. การวิเคราะห์บริบทและเจตนา (Intent & Context Ingestion):
   - ตีความคำสั่งของผู้ใช้อย่างลึกซึ้ง เชื่อมโยงกับ Telemetry สด, องค์ความรู้ในสมอง, และโค้ดไฟล์จริง
   - กฎเหล็ก: ข้อมูล Telemetry ด้านล่างมีไว้เป็นฐานข้อมูลอ้างอิงเมื่อผู้ใช้ถามเรื่องเครือข่าย/อุปกรณ์เท่านั้น **ห้ามส่ง 'แจ้งเตือนวิกฤต' หรือทักเรื่องอุปกรณ์ออฟไลน์แทรกเข้ามาในแชตโดยเด็ดขาดหากผู้ใช้ไม่ได้ถามถึง**
2. การวางแผนและตรวจสอบความปลอดภัย (Execution Planning & Safety Check):
   - วางแผนเป็นลำดับขั้นตอน (Step-by-Step Analytical Breakdown)
   - ป้องกัน Route Conflict: หน้าทั่วไปอยู่ใน src/app/(website)/ เช่น /test อยู่ที่ src/app/(website)/test/page.tsx ห้ามสร้างไฟล์ทับซ้อนนอกกลุ่ม Route Group
   - ห้ามเขียนโค้ดจำลอง (NO MOCK COMPONENT) เพื่อลบฟังก์ชันเดิมของระบบทิ้งเด็ดขาด
3. การลงมือปฏิบัติการอย่างแม่นยำ (Deterministic Execution):
   - หากผู้ใช้สั่งให้ดำเนินการ แก้ไข หรือสร้างหน้าเว็บ ให้ส่งข้อเสนอโค้ดผ่านแท็ก [CODE_PROPOSAL] เสมอ
   - รูปแบบ JSON ที่ถูกต้อง 100% ภายในแท็ก:
     สำหรับแก้ไขเฉพาะจุด (แนะนำสำหรับไฟล์ใหญ่):
[CODE_PROPOSAL]
{
  "filePath": "src/app/...",
  "action": "patch",
  "description": "คำอธิบายการปรับปรุงสั้นๆ ชัดเจน",
  "target": "ข้อความเดิมในไฟล์ที่ต้องการแทนที่อย่างแม่นยำ",
  "replacement": "ข้อความใหม่ที่จะนำไปแทนที่"
}
[/CODE_PROPOSAL]
     สำหรับสร้างไฟล์ใหม่หรือเขียนทั้งไฟล์:
[CODE_PROPOSAL]
{
  "filePath": "src/app/...",
  "action": "modify" หรือ "create",
  "description": "คำอธิบายสิ่งที่ปรับปรุง",
  "code": "เนื้อหาโค้ดทั้งไฟล์ที่สมบูรณ์แบบพร้อมใช้งาน (ห้ามย่อโค้ดด้วย ...)"
}
[/CODE_PROPOSAL]
4. การตรวจสอบผลลัพธ์และรายงานผล (Verification & Feedback Loop):
   - อธิบายสิ่งที่ปรับปรุงอย่างชัดเจน และแจ้งเตือนให้ Super Admin ทราบว่าสามารถกด "อนุมัติ บันทึก + Rebuild ทันที" เพื่อให้ระบบรัน Live Task Runner คอมไพล์ขึ้นเว็บจริงได้เลย
7. การประมวลผลภาพถ่ายและไฟล์แนบ (Multimodal Vision & Diagnostics):
   - หาก Super Admin แนบรูปภาพหรือถ่ายภาพมา (เช่น ภาพตู้ Rack, สายแลน, สายไฟเบอร์, พอร์ต Switch, ไฟสถานะ, หรือหน้าจอ Error): ให้อ่านและวิเคราะห์ภาพอย่างละเอียด ชี้เป้าอุปกรณ์ จุดผิดปกติ หรือวิธีแก้ไขให้ชัดเจน
   - หากแนบไฟล์ Config/Logs: ให้อ่านและสรุปจุดบกพร่อง พร้อมแนะนำการแก้ไข

${retrievedMemories}

${liveTelemetryReport}

${liveWebReport}

${inspectedFileContext}

${attachmentContext}

ตอบเป็นภาษาไทย มีโครงสร้าง สรุปผลการประมวลผลอย่างกระชับ ตรงประเด็น และใช้งานได้จริงทันที
`.trim();

    let aiResponseText = "";
    let activeModelName = useModel || "gemini-3.5-flash";

    const hasVisualAttachments = (attachments || []).some(
      (a: any) => a.base64 && (a.type?.startsWith("image/") || a.type === "application/pdf")
    );

    // 1. If Local M1 requested and NO visual attachments (m1 is text-only Llama 3)
    if (useModel === "m1" && !hasVisualAttachments) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "m1",
            prompt: `${systemPrompt}\n\nSuper Admin: ${message || "ประมวลผลข้อมูล"}\nM1:`,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          aiResponseText = data.response || "";
          activeModelName = "Agent M1 (Local Engine)";
        }
      } catch (err) {
        console.warn("Local M1 error or timeout, trying cloud fallback:", err);
      }
    }

    // 2. Cloud Gemini (Multimodal Vision for attachments, or text fallback)
    if (!aiResponseText && process.env.GEMINI_API_KEY) {
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const requestedModel =
          useModel && useModel.startsWith("gemini") ? useModel : "gemini-3.6-flash";
        const candidateModels = Array.from(
          new Set([
            requestedModel,
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-3.8-flash",
            "gemini-2.0-flash",
          ])
        );

        const contents: any[] = [];
        if (Array.isArray(history)) {
          history.forEach((h: any) => {
            if (h.role === "user" || h.role === "model") {
              contents.push({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }],
              });
            }
          });
        }

        const userParts: any[] = [
          {
            text: `${systemPrompt}\n\nSuper Admin: ${
              message || "วิเคราะห์และอธิบายรูปภาพ/ไฟล์ที่แนบมานี้อย่างละเอียด มีโครงสร้าง"
            }`,
          },
        ];

        // Attach images and PDFs as inlineData for Gemini Multimodal Vision
        if (Array.isArray(attachments)) {
          for (const att of attachments) {
            if (att.base64 && (att.type?.startsWith("image/") || att.type === "application/pdf")) {
              const base64Data = att.base64.replace(/^data:[^;]+;base64,/, "");
              userParts.push({
                inlineData: {
                  mimeType: att.type || "image/jpeg",
                  data: base64Data,
                },
              });
            }
          }
        }

        contents.push({
          role: "user",
          parts: userParts,
        });

        for (const targetModel of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey}`;
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents }),
            });

            if (res.ok) {
              const data = await res.json();
              aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (aiResponseText) {
                if (useModel === "m1" && hasVisualAttachments) {
                  activeModelName = `Agent M1 Multimodal Vision (${targetModel})`;
                } else if (targetModel === "gemini-3.7-flash") {
                  activeModelName = "Google AI Pro (Gemini 3.7 Flash)";
                } else if (targetModel === "gemini-3.5-flash") {
                  activeModelName = "Google AI (Gemini 3.5 Flash)";
                } else if (targetModel === "gemini-3.5-flash-lite") {
                  activeModelName = "Google AI Lite (Gemini 3.5 Flash)";
                } else if (targetModel === "gemini-3.6-flash") {
                  activeModelName = "Google AI (Gemini 3.6 Flash)";
                } else {
                  activeModelName = targetModel;
                }
                break;
              }
            } else {
              console.warn(
                `Gemini model ${targetModel} returned status ${res.status}, trying next fallback model...`
              );
            }
          } catch (modelErr) {
            console.warn(`Fetch error with Gemini model ${targetModel}:`, modelErr);
          }
        }
      } catch (err) {
        console.error("Gemini pipeline error:", err);
      }
    }

    if (!aiResponseText) {
      return NextResponse.json({
        error: "AI engine temporarily unavailable",
        reply: "⚠️ ขออภัยครับ ขณะนี้ระบบประมวลผล AI กำลังทำงานหนักหรือการเชื่อมต่อขัดข้องชั่วคราว กรุณากดส่งคำถามใหม่อีกครั้งในอีกสักครู่ครับ",
      });
    }

    // 3. Autonomous Cognitive Self-Learning Pipeline:
    // M1 actively analyzes the conversation, extracts new facts/rules/solutions, and synthesizes knowledge
    let learnedItem: any = null;
    try {
      learnedItem = await extractAutonomousKnowledge(message, aiResponseText, db);
    } catch (err) {
      console.error("Autonomous knowledge extraction error:", err);
    }

    // Also store conversation log for dataset building
    const logCol = db.collection("m1_conversations");
    logCol.insertOne({
      userMessage: message,
      aiResponse: aiResponseText,
      model: activeModelName,
      learned: !!learnedItem,
      timestamp: new Date(),
    }).catch(console.error);

    // 4. Extract Code Modification Proposal (if M1 proposed any file changes)
    const { proposal: codeProposal, cleanedText } = extractCodeProposal(aiResponseText);

    // 5. Multi-Room Chat Session Persistence:
    const activeSessionId = sessionId || randomUUID();
    const timeStr = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const messagesCol = db.collection("m1_chat_messages");
    const sessionsCol = db.collection("m1_chat_sessions");

    // Save User Message
    messagesCol.insertOne({
      sessionId: activeSessionId,
      role: "user",
      content: message || "ส่งไฟล์/รูปภาพแนบ",
      timestamp: timeStr,
      attachments: Array.isArray(attachments) ? attachments : undefined,
      createdAt: new Date(),
    }).catch(console.error);

    // Save AI Reply
    messagesCol.insertOne({
      sessionId: activeSessionId,
      role: "model",
      content: cleanedText || aiResponseText,
      timestamp: timeStr,
      modelUsed: activeModelName,
      learnedAlert: learnedItem ? `🧠 M1 ประมวลผลและเรียนรู้ข้อมูลใหม่โดยอัตโนมัติ: [${learnedItem.topic}]` : undefined,
      webSources: webResults.length > 0 ? webResults : undefined,
      codeProposal: codeProposal || undefined,
      createdAt: new Date(),
    }).catch(console.error);

    // Upsert Session meta
    const sessionTitle = (message || "บทสนทนาใหม่").slice(0, 35);
    sessionsCol.updateOne(
      { sessionId: activeSessionId },
      {
        $set: {
          lastMessage: (cleanedText || aiResponseText).slice(0, 80),
          updatedAt: new Date(),
          model: activeModelName,
        },
        $setOnInsert: {
          sessionId: activeSessionId,
          title: sessionTitle,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
      reply: cleanedText || aiResponseText,
      codeProposal,
      modelUsed: activeModelName,
      learnedItem,
      webSources: webResults.length > 0 ? webResults : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
