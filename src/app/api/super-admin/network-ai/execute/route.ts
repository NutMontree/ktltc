import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NodeSSH } from "node-ssh";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface DeviceConfig {
  host: string;
  username: string;
  password?: string;
  algorithms?: any;
}

const DEVICE_TARGETS: Record<string, DeviceConfig> = {
  aruba_core: {
    host: "192.168.6.3",
    username: "admin",
    password: "Ktltc@33110",
  },
  cisco_b4: {
    host: "192.168.6.210",
    username: "cisco",
    password: "Ktltc@33110",
    algorithms: {
      kex: [
        "diffie-hellman-group1-sha1",
        "diffie-hellman-group14-sha1",
        "diffie-hellman-group-exchange-sha1",
        "diffie-hellman-group-exchange-sha256",
      ],
      cipher: [
        "aes128-cbc",
        "aes192-cbc",
        "aes256-cbc",
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "3des-cbc",
      ],
      serverHostKey: ["ssh-rsa", "ssh-dss"],
    },
  },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { target, command } = await req.json();

    if (!target || !command || typeof command !== "string") {
      return NextResponse.json({ error: "Target and command are required" }, { status: 400 });
    }

    const trimmedCmd = command.trim();
    if (!trimmedCmd) {
      return NextResponse.json({ error: "Command cannot be empty" }, { status: 400 });
    }

    // 1. Local Server execution (Bash)
    if (target === "server") {
      try {
        const { stdout, stderr } = await execAsync(trimmedCmd, {
          timeout: 10000,
          maxBuffer: 1024 * 1024,
        });
        return NextResponse.json({
          success: true,
          target: "ktltc-server",
          command: trimmedCmd,
          output: stdout || stderr || "Execution finished (no output)",
          executedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          target: "ktltc-server",
          command: trimmedCmd,
          output: err.stdout ? `${err.stdout}\n${err.stderr}` : err.message,
          executedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Remote Network Device execution via SSH (Aruba Core / Cisco)
    const deviceConfig = DEVICE_TARGETS[target];
    if (!deviceConfig) {
      return NextResponse.json(
        { error: `Unknown target device: ${target}. Supported: server, aruba_core, cisco_b4` },
        { status: 400 }
      );
    }

    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: deviceConfig.host,
        username: deviceConfig.username,
        password: deviceConfig.password,
        readyTimeout: 7000,
        tryKeyboard: true,
        onKeyboardInteractive: (
          _name: any,
          _instructions: any,
          _instructionsLang: any,
          prompts: any,
          finish: any
        ) => {
          if (prompts.length > 0 && deviceConfig.password) {
            finish([deviceConfig.password]);
          }
        },
        algorithms: deviceConfig.algorithms,
      });

      const result = await ssh.execCommand(trimmedCmd);
      ssh.dispose();

      return NextResponse.json({
        success: true,
        target: target === "aruba_core" ? "Aruba 8320 Core Switch" : "Cisco SG500-28",
        command: trimmedCmd,
        output: result.stdout || result.stderr || "Command executed with no output",
        executedAt: new Date().toISOString(),
      });
    } catch (sshErr: any) {
      ssh.dispose();
      return NextResponse.json({
        success: false,
        target: target === "aruba_core" ? "Aruba 8320 Core Switch" : "Cisco SG500-28",
        command: trimmedCmd,
        output: `SSH Connection/Execution Error: ${sshErr.message}`,
        executedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Execution error",
      },
      { status: 500 }
    );
  }
}
