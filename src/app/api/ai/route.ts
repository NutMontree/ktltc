import { NextRequest, NextResponse } from "next/server";
import { chat, codeHelper } from "@/lib/cloudflare-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, code, instruction } = body;

    let result: string | null = null;

    switch (type) {
      case "chat":
        result = await chat(message);
        break;
      case "write":
        result = await codeHelper("write", undefined, instruction);
        break;
      case "fix":
        result = await codeHelper("fix", code, instruction);
        break;
      case "explain":
        result = await codeHelper("explain", code);
        break;
      case "refactor":
        result = await codeHelper("refactor", code, instruction);
        break;
      default:
        result = await chat(message);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
