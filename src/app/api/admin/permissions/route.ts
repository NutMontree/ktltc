import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULT_LABELS = {
  super_admin: "ผู้ดูแลระบบสูงสุด",
  admin: "ผู้ดูแลระบบ",
  editor: "บรรณาธิการ",
  hr: "ฝ่ายบุคคล",
  director: "ผู้อำนวยการ",
  deputy_resource: "รอง ผอ. (บริหารทรัพยากร)",
  deputy_strategy: "รอง ผอ. (ยุทธศาสตร์)",
  deputy_academic: "รอง ผอ. (วิชาการ)",
  deputy_student_affairs: "รอง ผอ. (กิจการนักเรียน)",
  teacher: "ครู",
  janitor: "แม่บ้าน/นักการ",
  staff: "เจ้าหน้าที่",
  student: "นักเรียน",
  user: "สมาชิกทั่วไป",
};

const DEFAULT_PERMISSIONS = {
  super_admin: {
    access_dashboard: true,
    manage_users: true,
    manage_news: true,
    manage_attendance: true,
    manage_system: true,
    manage_qa: true,
    manage_pages: true,
  },
  admin: {
    access_dashboard: true,
    manage_users: false,
    manage_news: true,
    manage_attendance: false,
    manage_system: false,
    manage_qa: true,
    manage_pages: false,
  },
  editor: {
    access_dashboard: true,
    manage_users: false,
    manage_news: true,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: true,
  },
  hr: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  director: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  deputy_resource: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  deputy_strategy: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  deputy_academic: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  deputy_student_affairs: {
    access_dashboard: true,
    manage_users: false,
    manage_news: false,
    manage_attendance: true,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  },
  teacher: {
    access_dashboard: false,
    manage_users: false,
    manage_news: false,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: true,
  },
  janitor: {
    access_dashboard: false,
    manage_users: false,
    manage_news: false,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: true,
  },
  staff: {
    access_dashboard: false,
    manage_users: false,
    manage_news: false,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: true,
  },
  student: {
    access_dashboard: false,
    manage_users: false,
    manage_news: false,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: true,
  },
  user: {
    access_dashboard: false,
    manage_users: false,
    manage_news: false,
    manage_attendance: false,
    manage_system: false,
    manage_qa: false,
    manage_pages: false,
  }
};

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const dbPermissions = await db.collection("role_permissions").find({}).toArray();
    
    // Merge DB permissions with defaults
    const permissions: any = {};
    const labels: any = { ...DEFAULT_LABELS };

    // Initial load from defaults
    Object.keys(DEFAULT_PERMISSIONS).forEach(role => {
      permissions[role] = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS];
    });

    dbPermissions.forEach(p => {
      if (permissions[p.role]) {
        permissions[p.role] = {
          ...permissions[p.role],
          ...p.permissions
        };
      } else {
        // Handle custom roles
        permissions[p.role] = p.permissions;
      }
      if (p.label) {
        labels[p.role] = p.label;
      }
    });

    return NextResponse.json({ permissions, labels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { updates } = body; // Array of { role, permissions }
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const bulkOps = updates
      .filter(u => u.role !== "super_admin")
      .map(u => ({
        updateOne: {
          filter: { role: u.role },
          update: { $set: { permissions: u.permissions, updatedAt: new Date() } },
          upsert: true
        }
      }));

    if (bulkOps.length > 0) {
      await db.collection("role_permissions").bulkWrite(bulkOps);

      // Log the change
      await db.collection("logs").insertOne({
        userName: (session.user as any).name || "Super Admin",
        action: "UPDATE_BULK_PERMISSIONS",
        details: `Updated permissions for ${bulkOps.length} roles`,
        timestamp: new Date(),
        role: "super_admin"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, label } = await req.json();

    if (!role || !label) {
      return NextResponse.json({ error: "Role and Label are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check if role exists
    const existing = await db.collection("role_permissions").findOne({ role });
    if (existing || DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS]) {
      return NextResponse.json({ error: "Role already exists" }, { status: 400 });
    }

    // Create new role with default "limited" permissions
    const defaultNewPermissions = {
      access_dashboard: false,
      manage_users: false,
      manage_news: false,
      manage_attendance: false,
      manage_system: false,
      manage_qa: false,
      manage_pages: false,
    };

    await db.collection("role_permissions").insertOne({
      role,
      label,
      permissions: defaultNewPermissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
