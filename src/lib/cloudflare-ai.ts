import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
});

const SMART_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
const REASONING_MODEL = "@cf/qwen/qwq-32b";
const FAST_MODEL = "@cf/meta/llama-3.1-8b-instruct";

export async function chat(message: string, systemPrompt?: string, model?: string) {
  try {
    const response = await openai.chat.completions.create({
      model: model || SMART_MODEL,
      messages: [
        { role: "system", content: systemPrompt || "คุณเป็นผู้ช่วย AI ที่เชี่ยวชาญด้านการเขียนโค้ด ตอบเป็นภาษาไทย กระชับ ชัดเจน" },
        { role: "user", content: message },
      ],
      max_tokens: 4096,
    });
    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("[Cloudflare AI] chat error:", error?.message);
    try {
      const fallback = await openai.chat.completions.create({
        model: FAST_MODEL,
        messages: [
          { role: "system", content: systemPrompt || "คุณเป็นผู้ช่วย AI ตอบเป็นภาษาไทย" },
          { role: "user", content: message },
        ],
        max_tokens: 2048,
      });
      return fallback.choices[0].message.content;
    } catch (fallbackError: any) {
      return `❌ AI ไม่สามารถตอบได้: ${error?.message || "Unknown error"}`;
    }
  }
}

export async function chatStream(message: string, systemPrompt?: string, model?: string) {
  const stream = await openai.chat.completions.create({
    model: model || SMART_MODEL,
    messages: [
      { role: "system", content: systemPrompt || "คุณเป็นผู้ช่วย AI ที่เชี่ยวชาญด้านการเขียนโค้ด ตอบเป็นภาษาไทย กระชับ ชัดเจน" },
      { role: "user", content: message },
    ],
    max_tokens: 4096,
    stream: true,
  });
  return stream;
}

export async function codeHelper(action: "write" | "fix" | "explain" | "refactor", code?: string, instruction?: string) {
  const prompts = {
    write: `เขียนโค้ดตามคำสั่ง: ${instruction}`,
    fix: `แก้บั๊กในโค้ดนี้:\n${code}\nปัญหา: ${instruction}`,
    explain: `อธิบายโค้ดนี้เป็นภาษาไทยแบบละเอียด:\n${code}`,
    refactor: `ปรับปรุงโค้ดนี้ให้ดีขึ้น:\n${code}\nคำแนะนำ: ${instruction}`,
  };
  return chat(prompts[action], "คุณเป็น AI ผู้เชี่ยวชาญด้านการเขียนโค้ด Next.js, TypeScript, React, MongoDB, Node.js ตอบเป็นภาษาไทย พร้อมตัวอย่างโค้ด ตอบกระชับ ชัดเจน", REASONING_MODEL);
}

export async function codeHelperStream(action: "write" | "fix" | "explain" | "refactor", code?: string, instruction?: string) {
  const prompts = {
    write: `เขียนโค้ดตามคำสั่ง: ${instruction}`,
    fix: `แก้บั๊กในโค้ดนี้:\n${code}\nปัญหา: ${instruction}`,
    explain: `อธิบายโค้ดนี้เป็นภาษาไทยแบบละเอียด:\n${code}`,
    refactor: `ปรับปรุงโค้ดนี้ให้ดีขึ้น:\n${code}\nคำแนะนำ: ${instruction}`,
  };
  return chatStream(prompts[action], "คุณเป็น AI ผู้เชี่ยวชาญด้านการเขียนโค้ด Next.js, TypeScript, React, MongoDB, Node.js ตอบเป็นภาษาไทย พร้อมตัวอย่างโค้ด ตอบกระชับ ชัดเจน", REASONING_MODEL);
}

export async function generateImage(prompt: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
    {
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ prompt }),
    }
  );
  return await response.json();
}

export { openai, SMART_MODEL, REASONING_MODEL, FAST_MODEL };
