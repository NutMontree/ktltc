import { NextRequest, NextResponse } from "next/server";
import { chat, codeHelper } from "@/lib/cloudflare-ai";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.join(process.cwd());

function safePath(fp: string) {
  const resolved = path.resolve(ROOT_DIR, fp);
  if (!resolved.startsWith(ROOT_DIR)) throw new Error("Path traversal denied");
  return resolved;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, message, filePath, dirPath } = body;

    switch (action) {
      case "list": {
        const target = safePath(dirPath || ".");
        const entries = fs.readdirSync(target, { withFileTypes: true });
        const files = entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : "file",
        }));
        return NextResponse.json({ success: true, result: { files } });
      }

      case "read": {
        const target = safePath(filePath);
        const content = fs.readFileSync(target, "utf-8");
        return NextResponse.json({ success: true, result: { content } });
      }

      case "ai-chat": {
        const response = await chat(message);
        return NextResponse.json({ success: true, result: { response } });
      }

      case "ai-read": {
        const target = safePath(filePath);
        const content = fs.readFileSync(target, "utf-8");
        const aiExplanation = await codeHelper("explain", content);
        return NextResponse.json({
          success: true,
          result: { aiExplanation, fileContent: content },
        });
      }

      case "ai-write": {
        const target = safePath(filePath);
const aiContent = await codeHelper("write", undefined, `เขียนไฟล์ ${filePath}: ${message}`);
const cleanContent = (aiContent || "").replace(/^```\w*\n?/, "").replace(/\n?```$/, "");        fs.writeFileSync(target, cleanContent, "utf-8");
        const preview = cleanContent.substring(0, 500);
        return NextResponse.json({
          success: true,
          result: { aiGenerated: true, path: filePath, preview },
        });
      }

      case "ai-edit": {
        const target = safePath(filePath);
        const original = fs.readFileSync(target, "utf-8");
const aiContent = await codeHelper("fix", original, `แก้ไขไฟล์ ${filePath}: ${message}`);
const cleanContent = (aiContent || "").replace(/^```\w*\n?/, "").replace(/\n?```$/, "");        fs.writeFileSync(target, cleanContent, "utf-8");
        return NextResponse.json({
          success: true,
          result: { aiEdited: true, path: filePath },
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
