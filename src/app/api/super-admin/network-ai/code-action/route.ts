import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

// Background Task Interface for Live Console Runner (สไตล์ Antigravity)
interface M1Task {
  id: string;
  command: string;
  status: "idle" | "running" | "success" | "error";
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  outputLogs: string[];
  exitCode?: number | null;
  error?: string;
}

declare global {
  var __ktltc_m1_task: M1Task | undefined;
}

// Allowed root directory for M1 edits (Sandbox to project src/ folder)
const PROJECT_ROOT = process.cwd().includes(path.join(".next", "standalone"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const ALLOWED_SANDBOX_DIR = path.resolve(PROJECT_ROOT, "src");

// Validate that a relative filePath is safely located within src/
function validateSafePath(relativeFilePath: string): { safe: boolean; fullPath?: string; error?: string } {
  if (!relativeFilePath || typeof relativeFilePath !== "string") {
    return { safe: false, error: "ระบุพาธไฟล์ไม่ถูกต้อง" };
  }

  // Normalize and clean path
  const normalized = path.normalize(relativeFilePath).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.resolve(PROJECT_ROOT, normalized);

  // Strictly ensure fullPath starts within ALLOWED_SANDBOX_DIR
  if (!fullPath.startsWith(ALLOWED_SANDBOX_DIR)) {
    return {
      safe: false,
      error: "เข้าถึงไม่ได้: อนุญาตให้แก้ไขเฉพาะไฟล์ในโฟลเดอร์ src/ เท่านั้น เพื่อความปลอดภัยของเซิร์ฟเวอร์",
    };
  }

  // Block dangerous files even inside src (e.g. env files, hidden config files)
  const baseName = path.basename(fullPath);
  if (baseName.startsWith(".env") || baseName.startsWith(".git") || baseName.includes("package.json")) {
    return { safe: false, error: "ไฟล์นี้ถูกจำกัดสิทธิ์ ไม่อนุญาตให้แก้ไขผ่านระบบอัตโนมัติ" };
  }

  // Check file extensions allowed for web modification
  const allowedExtensions = [".tsx", ".ts", ".jsx", ".js", ".css", ".json"];
  const ext = path.extname(fullPath).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { safe: false, error: `ไม่อนุญาตให้นามสกุลไฟล์ ${ext} ถูกแก้ไขผ่าน M1` };
  }

  return { safe: true, fullPath };
}

// GET: Polling live task status and real-time build logs
export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  const currentTask = globalThis.__ktltc_m1_task || {
    id: "",
    command: "",
    status: "idle" as const,
    startedAt: "",
    durationSeconds: 0,
    outputLogs: [],
  };

  // If currently running, calculate dynamic duration
  if (currentTask.status === "running" && currentTask.startedAt) {
    const elapsed = Math.round((Date.now() - new Date(currentTask.startedAt).getTime()) / 1000);
    currentTask.durationSeconds = Math.max(0, elapsed);
  }

  return NextResponse.json({
    success: true,
    task: currentTask,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { action, filePath, code, target, replacement, andRebuild } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // 1. Rebuild and PM2 Reload Action with Live Streamed Logs
    if (action === "rebuild") {
      const taskId = `task-${Date.now()}`;
      const commandStr = "npm run build && pm2 reload ktltc --update-env && pm2 save";
      const startTime = new Date();

      globalThis.__ktltc_m1_task = {
        id: taskId,
        command: commandStr,
        status: "running",
        startedAt: startTime.toISOString(),
        durationSeconds: 0,
        outputLogs: [
          `[${startTime.toLocaleTimeString("th-TH")}] ⚙️ 1 task running`,
          `CommandLine: ${commandStr}`,
          `Cwd: ${PROJECT_ROOT}`,
          `--- กำลังเริ่มต้นรัน Turbopack Build และ PM2 Cluster Reload ---`,
        ],
        exitCode: null,
      };

      const child = spawn("bash", ["-c", commandStr], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin:/bin`,
        },
      });

      const appendLog = (data: Buffer) => {
        const text = data.toString("utf-8");
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (globalThis.__ktltc_m1_task && globalThis.__ktltc_m1_task.id === taskId) {
          globalThis.__ktltc_m1_task.outputLogs.push(...lines);
          if (globalThis.__ktltc_m1_task.outputLogs.length > 250) {
            globalThis.__ktltc_m1_task.outputLogs = globalThis.__ktltc_m1_task.outputLogs.slice(-250);
          }
        }
      };

      child.stdout.on("data", appendLog);
      child.stderr.on("data", appendLog);

      child.on("close", (code) => {
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        if (globalThis.__ktltc_m1_task && globalThis.__ktltc_m1_task.id === taskId) {
          globalThis.__ktltc_m1_task.completedAt = endTime.toISOString();
          globalThis.__ktltc_m1_task.durationSeconds = duration;
          globalThis.__ktltc_m1_task.exitCode = code;
          if (code === 0) {
            globalThis.__ktltc_m1_task.status = "success";
            globalThis.__ktltc_m1_task.outputLogs.push(
              `--- ✅ สำเร็จสมบูรณ์ (Exit code: 0) ใช้เวลา ${duration} วินาที ---`
            );
          } else {
            globalThis.__ktltc_m1_task.status = "error";
            globalThis.__ktltc_m1_task.outputLogs.push(
              `--- ❌ กระบวนการล้มเหลว (Exit code: ${code}) โปรดตรวจสอบ Log ด้านบน ---`
            );
          }
        }
      });

      return NextResponse.json({
        success: true,
        taskId,
        message: "🚀 เริ่มต้นการ Build และ PM2 Reload เรียบร้อยแล้ว",
        task: globalThis.__ktltc_m1_task,
      });
    }

    // Path validation for file-specific actions
    const check = validateSafePath(filePath);
    if (!check.safe || !check.fullPath) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }
    const targetFullPath = check.fullPath;

    // 2. Read File Action
    if (action === "read") {
      try {
        const content = await fs.readFile(targetFullPath, "utf-8");
        return NextResponse.json({
          success: true,
          filePath,
          content,
        });
      } catch (err: any) {
        return NextResponse.json({ error: `ไม่สามารถเปิดอ่านไฟล์ได้: ${err.message}` }, { status: 404 });
      }
    }

    // 3. Apply Code Action (with Auto-Backup)
    if (action === "apply") {
      if (typeof code !== "string") {
        return NextResponse.json({ error: "ต้องระบุโค้ดที่ต้องการบันทึก" }, { status: 400 });
      }

      // Check if file exists to create a backup
      let fileExists = false;
      try {
        await fs.access(targetFullPath);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      const backupFile = `${targetFullPath}.bak`;
      if (fileExists) {
        // Create backup
        const currentContent = await fs.readFile(targetFullPath, "utf-8");
        await fs.writeFile(backupFile, currentContent, "utf-8");
      }

      // Ensure directory exists
      await fs.mkdir(path.dirname(targetFullPath), { recursive: true });

      // Write new code
      await fs.writeFile(targetFullPath, code, "utf-8");

      return NextResponse.json({
        success: true,
        message: `✅ บันทึกไฟล์ ${filePath} สำเร็จเรียบร้อยแล้ว`,
        hasBackup: fileExists,
        backupFile: fileExists ? path.relative(PROJECT_ROOT, backupFile) : null,
      });
    }

    // 3.1 Patch Action (Targeted replacement)
    if (action === "patch") {
      if (!target || typeof replacement !== "string") {
        return NextResponse.json({ error: "ต้องระบุ target และ replacement สำหรับการ patch" }, { status: 400 });
      }

      let currentContent = "";
      try {
        currentContent = await fs.readFile(targetFullPath, "utf-8");
      } catch (err: any) {
        return NextResponse.json({ error: `ไม่สามารถอ่านไฟล์ ${filePath}: ${err.message}` }, { status: 404 });
      }

      if (!currentContent.includes(target)) {
        return NextResponse.json({
          error: `ไม่พบข้อความเป้าหมาย (Target) ในไฟล์ ${filePath} เพื่อทำการ Patch`,
        }, { status: 400 });
      }

      // Create backup
      const backupFile = `${targetFullPath}.bak`;
      await fs.writeFile(backupFile, currentContent, "utf-8");

      // Replace target with replacement
      const newContent = currentContent.replace(target, replacement);
      await fs.writeFile(targetFullPath, newContent, "utf-8");

      return NextResponse.json({
        success: true,
        message: `✅ Patch ไฟล์ ${filePath} สำเร็จเรียบร้อยแล้ว`,
        hasBackup: true,
        backupFile: path.relative(PROJECT_ROOT, backupFile),
      });
    }

    // 4. Rollback Action
    if (action === "rollback") {
      const backupFile = `${targetFullPath}.bak`;
      try {
        await fs.access(backupFile);
      } catch {
        return NextResponse.json({ error: `ไม่พบไฟล์สำรอง (.bak) ของ ${filePath}` }, { status: 404 });
      }

      const backupContent = await fs.readFile(backupFile, "utf-8");
      await fs.writeFile(targetFullPath, backupContent, "utf-8");

      return NextResponse.json({
        success: true,
        message: `⏪ กู้คืนไฟล์ ${filePath} จากข้อมูลสำรองเดิมเรียบร้อยแล้ว`,
      });
    }

    return NextResponse.json({ error: `Action '${action}' ไม่ถูกต้อง` }, { status: 400 });
  } catch (err: any) {
    console.error("Code action error:", err);
    return NextResponse.json({ error: err.message || "เกิดข้อผิดพลาดในการจัดการไฟล์" }, { status: 500 });
  }
}
