import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface DeviceTarget {
  id: string;
  name: string;
  role: string;
  ip: string;
  location: string;
  vlan: string;
  corePort?: string;
  brand?: string;
}

const MONITORED_DEVICES: DeviceTarget[] = [
  // Core & Firewall
  {
    id: "fw-1",
    name: "HUAWEI USG6525E",
    role: "Core Firewall & Gateway (Port 1/1/48)",
    ip: "192.168.6.1",
    location: "Server Room Rack 1",
    vlan: "VLAN 6 (Mgmt)",
    corePort: "1/1/48",
    brand: "Huawei",
  },
  {
    id: "core-1",
    name: "Aruba 8320 (48Port)",
    role: "Core Switch 10G Backbone",
    ip: "192.168.6.3",
    location: "Server Room Rack 1",
    vlan: "VLAN 6 (Mgmt)",
    corePort: "1/1/48",
    brand: "Aruba",
  },
  // Campus Building Switches (Mapped to Core Switch 8320 Ports)
  {
    id: "sw-14",
    name: "HPE 1930 (V19)",
    role: "Edge Switch (Core Port 1/1/1)",
    ip: "192.168.6.14",
    location: "ตึกวิทยบริการ",
    vlan: "VLAN 19",
    corePort: "1/1/1",
    brand: "HPE",
  },
  {
    id: "sw-12",
    name: "HPE 1930 (V14)",
    role: "Edge Switch (Core Port 1/1/2)",
    ip: "192.168.6.12",
    location: "อาคารช่างกลโรงงาน",
    vlan: "VLAN 14",
    corePort: "1/1/2",
    brand: "HPE",
  },
  {
    id: "sw-15",
    name: "HPE 1930 (V20)",
    role: "Edge Switch (Core Port 1/1/3)",
    ip: "192.168.6.15",
    location: "ตึกสามัญ",
    vlan: "VLAN 20",
    corePort: "1/1/3",
    brand: "HPE",
  },
  {
    id: "sw-11",
    name: "HPE 1930 (V11)",
    role: "Edge Switch (Core Port 1/1/4)",
    ip: "192.168.6.11",
    location: "อาคารช่างเชื่อม+พื้นฐาน",
    vlan: "VLAN 11",
    corePort: "1/1/4",
    brand: "HPE",
  },
  {
    id: "sw-13",
    name: "Edge Switch (V18)",
    role: "Edge Switch (Core Port 1/1/5)",
    ip: "192.168.6.13",
    location: "อาคารช่างยนต์",
    vlan: "VLAN 18",
    corePort: "1/1/5",
    brand: "Switch",
  },
  {
    id: "sw-17",
    name: "HPE 1930 (V22)",
    role: "Edge Switch (Core Port 1/1/6)",
    ip: "192.168.6.17",
    location: "อาคารอิเล็กทรอนิกส์",
    vlan: "VLAN 22",
    corePort: "1/1/6",
    brand: "HPE",
  },
  {
    id: "sw-10",
    name: "HPE 1930 (V10)",
    role: "Edge Switch (Core Port 1/1/7)",
    ip: "192.168.6.10",
    location: "ตึกอำนวยการ",
    vlan: "VLAN 10",
    corePort: "1/1/7",
    brand: "HPE",
  },
  {
    id: "sw-210",
    name: "Cisco SG500-28",
    role: "Floor Switch อาคาร 4 (Core Port 1/1/8)",
    ip: "192.168.6.210",
    location: "อาคาร 4 (แผนกคอมฯ)",
    vlan: "VLAN 6, 10, 90, 99",
    corePort: "1/1/8",
    brand: "Cisco",
  },
  {
    id: "sw-32",
    name: "Reyee RG-ES226GC-P",
    role: "Edge Switch (Core Port 1/1/9)",
    ip: "192.168.6.32",
    location: "ป้อมยาม",
    vlan: "VLAN 32",
    corePort: "1/1/9",
    brand: "Reyee",
  },
  {
    id: "sw-16",
    name: "Reyee RG-ES226GC-P",
    role: "Edge Switch (Core Port 1/1/10)",
    ip: "192.168.6.31",
    location: "ตึกโดม",
    vlan: "VLAN 31",
    corePort: "1/1/10",
    brand: "Reyee",
  },
  {
    id: "sw-35",
    name: "HPE 1930",
    role: "Edge Switch (Core Port 1/1/11)",
    ip: "192.168.6.35",
    location: "บ้านพักครู",
    vlan: "VLAN 35",
    corePort: "1/1/11",
    brand: "HPE",
  },
  // WAN Circuits & Internet
  {
    id: "wan-uninet",
    name: "UNINET (วงจรหลัก)",
    role: "WAN Uplink 1 (Uninet)",
    ip: "202.29.224.34",
    location: "ภายนอก / ISP Gateway",
    vlan: "Public WAN",
    brand: "UNINET",
  },
  {
    id: "wan-cat",
    name: "CAT / NT (วงจรสำรอง)",
    role: "WAN Uplink 2 (CAT NT)",
    ip: "122.154.155.45",
    location: "ภายนอก / ISP Gateway",
    vlan: "Public WAN",
    brand: "CAT NT",
  },
  {
    id: "internet_dns",
    name: "Google DNS Primary",
    role: "Internet Connectivity Check",
    ip: "8.8.8.8",
    location: "Global Anycast",
    vlan: "Internet",
    brand: "Google",
  },
];

async function pingHost(ip: string): Promise<{
  alive: boolean;
  latencyMs: number | null;
  packetLoss: number;
  raw: string;
}> {
  try {
    const { stdout } = await execAsync(`ping -c 1 -W 1 ${ip}`);
    const timeMatch = stdout.match(/time=([0-9.]+)\s*ms/);
    const lossMatch = stdout.match(/([0-9.]+)%\s*packet loss/);

    const latency = timeMatch ? parseFloat(timeMatch[1]) : null;
    const loss = lossMatch ? parseFloat(lossMatch[1]) : 0;

    return {
      alive: loss < 100,
      latencyMs: latency,
      packetLoss: loss,
      raw: stdout.trim(),
    };
  } catch (error: any) {
    const stdout = error.stdout || "";
    const lossMatch = stdout.match(/([0-9.]+)%\s*packet loss/);
    return {
      alive: false,
      latencyMs: null,
      packetLoss: lossMatch ? parseFloat(lossMatch[1]) : 100,
      raw: stdout ? stdout.trim() : error.message || "Timeout",
    };
  }
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  // Live ping checks across all monitored devices (NO MOCK DATA)
  const results = await Promise.all(
    MONITORED_DEVICES.map(async (device) => {
      const pingResult = await pingHost(device.ip);
      return {
        ...device,
        status: pingResult.alive ? "ONLINE" : "OFFLINE",
        latencyMs: pingResult.latencyMs,
        packetLoss: pingResult.packetLoss,
        rawOutput: pingResult.raw,
        lastChecked: new Date().toISOString(),
      };
    })
  );

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    devices: results,
  });
}

// On-demand custom ping endpoint
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { ip } = await req.json();
    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "Invalid IP address" }, { status: 400 });
    }

    // Basic sanitize to prevent shell injection
    const cleanIp = ip.trim();
    if (!/^[0-9a-zA-Z.:-]+$/.test(cleanIp)) {
      return NextResponse.json({ error: "Malformed IP or hostname" }, { status: 400 });
    }

    const { stdout } = await execAsync(`ping -c 3 -W 1 ${cleanIp}`);
    return NextResponse.json({ success: true, target: cleanIp, raw: stdout.trim() });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      raw: error.stdout ? error.stdout.trim() : error.message || "Ping failed",
    });
  }
}
