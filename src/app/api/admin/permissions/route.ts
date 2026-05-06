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
    
    // Sort DB roles by createdAt descending (newest first)
    const dbPermissions = await db.collection("role_permissions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Auto-seed logic...
    if (dbPermissions.length < Object.keys(DEFAULT_PERMISSIONS).length) {
      console.log("🌱 [API] Auto-seeding default roles to database...");
      for (const [role, perms] of Object.entries(DEFAULT_PERMISSIONS)) {
        await db.collection("role_permissions").updateOne(
          { role },
          { 
            $set: { 
              permissions: perms,
              label: DEFAULT_LABELS[role as keyof typeof DEFAULT_LABELS] || role,
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
      }
      // Re-fetch after seeding with sorting
      const updatedPermissions = await db.collection("role_permissions")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      dbPermissions.length = 0;
      dbPermissions.push(...updatedPermissions);
    }

    const permissions: any = {};
    const labels: any = { ...DEFAULT_LABELS };

    // Use an array to maintain strict order
    const rolesOrder: string[] = ["super_admin", "admin"];
    
    // Initial load from defaults
    Object.keys(DEFAULT_PERMISSIONS).forEach(role => {
      permissions[role] = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS];
    });

    dbPermissions.forEach(p => {
      if (!rolesOrder.includes(p.role)) {
        rolesOrder.push(p.role);
      }
      
      if (permissions[p.role]) {
        permissions[p.role] = {
          ...permissions[p.role],
          ...p.permissions
        };
      } else {
        permissions[p.role] = p.permissions || {};
      }

      // Ensure every role has a label, even if not in DEFAULT_LABELS
      if (p.label) {
        labels[p.role] = p.label;
      } else if (!labels[p.role]) {
        labels[p.role] = p.role; // Fallback to ID if no label exists
      }
    });

    return NextResponse.json({ permissions, labels, rolesOrder });
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
    console.log("🛠️ [API] PATCH Request Body:", JSON.stringify(body, null, 2));
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Case 1: Individual Role Rename/Update
    if (body.oldRole !== undefined && body.newRole !== undefined) {
      const { oldRole, newRole, label } = body;
      
      if (!oldRole || !newRole || !label) {
        console.log("❌ [API] Missing parameters:", { oldRole, newRole, label });
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
      }

      const SYSTEM_ROLES = ["super_admin", "admin"];
      if (SYSTEM_ROLES.includes(oldRole)) {
        console.log("❌ [API] Attempted to rename system role:", oldRole);
        return NextResponse.json({ error: "ไม่สามารถแก้ไขบทบาทระบบ (super_admin/admin) ได้" }, { status: 400 });
      }

      if (oldRole !== newRole) {
        const existing = await db.collection("role_permissions").findOne({ role: newRole });
        if (existing) {
          console.log("❌ [API] Target role already exists:", newRole);
          return NextResponse.json({ error: `รหัสบทบาท "${newRole}" มีอยู่แล้วในระบบ` }, { status: 400 });
        }
      }

      // Find current permissions to preserve them during rename
      const currentDoc = await db.collection("role_permissions").findOne({ role: oldRole });
      let permissionsToSet = currentDoc?.permissions || DEFAULT_PERMISSIONS[oldRole as keyof typeof DEFAULT_PERMISSIONS] || {};

      if (currentDoc) {
        await db.collection("role_permissions").updateOne(
          { _id: currentDoc._id },
          { 
            $set: { 
              role: newRole,
              label: label,
              permissions: permissionsToSet,
              updatedAt: new Date()
            }
          }
        );
      } else {
        await db.collection("role_permissions").insertOne({
          role: newRole,
          label: label,
          permissions: permissionsToSet,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      console.log("✅ [API] Role updated/renamed successfully:", oldRole, "->", newRole);

      await db.collection("logs").insertOne({
        userName: (session.user as any).name || "Super Admin",
        action: "RENAME_ROLE",
        details: `Renamed role from ${oldRole} to ${newRole}`,
        timestamp: new Date(),
        role: "super_admin"
      });

      return NextResponse.json({ success: true });
    }

    // Case 2: Bulk Permissions Update
    const { updates } = body; 
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const bulkOps = updates
      .filter(u => u.role !== "super_admin")
      .map(u => ({
        updateOne: {
          filter: { role: u.role },
          update: { 
            $set: { 
              permissions: u.permissions, 
              label: u.label, 
              updatedAt: new Date() 
            } 
          },
          upsert: true
        }
      }));

    if (bulkOps.length > 0) {
      await db.collection("role_permissions").bulkWrite(bulkOps);

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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const SYSTEM_PROTECTED_ROLES = ["super_admin", "admin"];

    if (SYSTEM_PROTECTED_ROLES.includes(role)) {
      return NextResponse.json({ error: "ไม่สามารถลบบทบาทระบบหลัก (super_admin/admin) ได้" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const result = await db.collection("role_permissions").deleteOne({ role });

    if (result.deletedCount > 0) {
      await db.collection("logs").insertOne({
        userName: (session.user as any).name || "Super Admin",
        action: "DELETE_ROLE",
        details: `Deleted role: ${role}`,
        timestamp: new Date(),
        role: "super_admin"
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
