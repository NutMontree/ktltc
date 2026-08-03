import { MongoClient } from 'mongodb';

const uri = "mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("ktltc_db");
    
    // Clear existing custom menus to avoid duplicates
    await db.collection("custom_menus").deleteMany({});
    console.log("Cleared existing custom menus.");

    const menus = [
      // 1. Sidebar Menus
      { title: "ระบบติดตาม PDCA", href: "/pdca", icon: "Activity", desc: "ระบบบริหารจัดการคุณภาพ", workspace: "staff", displayIn: "both", permissionKey: "custom_pdca", createdAt: new Date() },
      { title: "บันทึกข้อความทั่วไป", href: "/GeneralMemoPage", icon: "FileText", desc: "ระบบสารบรรณอิเล็กทรอนิกส์", workspace: "staff", displayIn: "both", permissionKey: "custom_memo", createdAt: new Date() },
      { title: "Chart Analytics", href: "/chart", icon: "BarChart2", desc: "วิเคราะห์ข้อมูลสถิติ", workspace: "staff", displayIn: "both", permissionKey: "custom_chart", createdAt: new Date() },
      { title: "แก้ไขหัวข้อฟอร์ม", href: "/form-editor", icon: "Edit", desc: "แก้ไขฟอร์มแบบสอบถาม", workspace: "staff", displayIn: "both", permissionKey: "custom_form_editor", createdAt: new Date() },
      { title: "ตั้งค่าระบบภายใน", href: "/internal-form-editor", icon: "Settings", desc: "ตั้งค่าระบบภายใน", workspace: "staff", displayIn: "both", permissionKey: "custom_internal_editor", createdAt: new Date() },

      // 2. Student Workspace
      { title: "เช็คชื่อเข้าแถวหน้าเสาธง", href: "/student/flagpole", icon: "Clock", desc: "ระบบเช็คชื่อด้วยพิกัด GPS", workspace: "student", displayIn: "dashboard", permissionKey: "student_dashboard", createdAt: new Date() },
      { title: "ศูนย์การศึกษาระบบทวิภาคี (DVE)", href: "/dashboard/dve/student", icon: "BookOpen", desc: "ระบบบันทึกสมุดฝึกงาน", workspace: "student", displayIn: "dashboard", permissionKey: "access_dve_student", createdAt: new Date() },
      { title: "แชท / กล่องข้อความ", href: "/dashboard/chat", icon: "MessageSquare", desc: "ติดต่อสื่อสารกับอาจารย์", workspace: "student", displayIn: "dashboard", permissionKey: "student_dashboard", createdAt: new Date() },

      // 3. Teacher Workspace
      { title: "ข้อมูลนักเรียนในที่ปรึกษา / แผนก", href: "/teacher/students", icon: "Users", desc: "ตรวจสอบประวัตินักเรียน", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_teacher_students", createdAt: new Date() },
      { title: "ระบบสแกนเข้า-ออก (Gate)", href: "/teacher/gate-scanner", icon: "ScanLine", desc: "สแกน QR Code หน้าประตู", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_gate_scanner", createdAt: new Date() },
      { title: "ระบบติดตามตำแหน่ง (GPS)", href: "/teacher/tracking", icon: "Navigation", desc: "แสดงพิกัดนักเรียนแบบ Real-time", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_gps_tracking", createdAt: new Date() },
      { title: "ระบบนิเทศนักศึกษาฝึกงาน", href: "/dashboard/supervision", icon: "ClipboardList", desc: "บันทึกข้อมูลการนิเทศ", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_dve_teacher", createdAt: new Date() },
      { title: "จัดการแผนการสอน", href: "/dashboard/director/lesson-plans", icon: "FileText", desc: "อัปโหลดแผนการสอน", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_lesson_plans", createdAt: new Date() },
      { title: "ประเมินผลการปฏิบัติงาน / DPA", href: "/dashboard/director/dpa-evaluation", icon: "ShieldCheck", desc: "ระบบประเมินครู DPA", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_dpa_evaluation", createdAt: new Date() },
      { title: "ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)", href: "/dashboard/director/plc", icon: "Users", desc: "บันทึกชั่วโมง PLC", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_plc", createdAt: new Date() },
      { title: "ระบบรายงานการปฏิบัติงาน", href: "/work-reports", icon: "ClipboardList", desc: "ตรวจสอบรายงานการปฏิบัติงาน", workspace: "teacher", displayIn: "dashboard", permissionKey: "manage_attendance_work_reports", createdAt: new Date() },
      { title: "ระบบดูแลช่วยเหลือนักเรียน", href: "/dashboard/director/student-care", icon: "ClipboardList", desc: "รายงานการเยี่ยมบ้าน", workspace: "teacher", displayIn: "dashboard", permissionKey: "access_student_care", createdAt: new Date() },

      // 4. Staff / HR Workspace
      { title: "คลังเอกสารดิจิทัล (Drive)", href: "/dashboard/drive", icon: "HardDrive", desc: "ระบบจัดเก็บไฟล์ส่วนกลาง", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_drive", createdAt: new Date() },
      { title: "จัดการข่าวประชาสัมพันธ์", href: "/dashboard/news", icon: "Newspaper", desc: "จัดการข่าวสาร", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_news", createdAt: new Date() },
      { title: "จัดการการเลือกตั้ง", href: "/dashboard/election", icon: "Users", desc: "ดูแลระบบสภานักเรียน", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_elections", createdAt: new Date() },
      { title: "ระบบถาม-ตอบ", href: "/dashboard/questions", icon: "MessageSquare", desc: "ตอบคำถามและข้อร้องเรียน", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_qa", createdAt: new Date() },
      { title: "จัดการข้อมูลการเข้าแถว", href: "/dashboard/flagpole-data-management", icon: "ClipboardList", desc: "แก้ไขพิกัด เวลา เช็คชื่อ", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_flagpole_data", createdAt: new Date() },
      { title: "สถิติภาพรวมการเข้าแถว", href: "/dashboard/flagpole-dashboard", icon: "Layers", desc: "รายงานสถิติเข้าแถว", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_flagpole_dashboard", createdAt: new Date() },
      { title: "ระบบรายงานการเข้าแถว", href: "/dashboard/flagpole-reports", icon: "FileText", desc: "พิมพ์รายงานสรุปเข้าแถว", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_flagpole_reports", createdAt: new Date() },
      { title: "ตรวจสอบข้อมูลนักเรียน", href: "/student-data-validation", icon: "ShieldCheck", desc: "ตรวจสอบความถูกต้องข้อมูล", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_student_data_validation", createdAt: new Date() },
      { title: "ระบบรายงานการปฏิบัติงาน", href: "/work-reports", icon: "ClipboardList", desc: "พิมพ์รายงานการปฏิบัติงาน", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_attendance_work_reports", createdAt: new Date() },
      { title: "ระบบข้อมูล ITA / OIT", href: "/dashboard/ita", icon: "ClipboardList", desc: "แก้ไขตัวชี้วัดความโปร่งใส", workspace: "staff", displayIn: "dashboard", permissionKey: "manage_ita", createdAt: new Date() },

      // 5. Executive Workspace
      { title: "แดชบอร์ดติดตามงานครู", href: "/teacher-dashboard", icon: "Clock", desc: "สถิติติดตามการลงสอน", workspace: "executive", displayIn: "dashboard", permissionKey: "access_teacher_dashboard", createdAt: new Date() },
      { title: "ตรวจสอบการจัดการเรียนการสอน", href: "/teacher-verification", icon: "CalendarCheck", desc: "ตรวจสอบการจัดการเรียน", workspace: "executive", displayIn: "dashboard", permissionKey: "access_teacher_verification", createdAt: new Date() },
      { title: "แดชบอร์ดการเข้างานบุคลากร", href: "/attendance-dashboard", icon: "CalendarCheck", desc: "สถิติการมาทำงาน", workspace: "executive", displayIn: "dashboard", permissionKey: "manage_attendance_dashboard", createdAt: new Date() },
      { title: "รายงานการเข้างาน", href: "/attendance-report", icon: "Clock", desc: "ออกรายงานสรุปการทำงาน", workspace: "executive", displayIn: "dashboard", permissionKey: "manage_attendance_dashboard", createdAt: new Date() },
      { title: "ระบบรายงานการปฏิบัติงาน", href: "/work-reports", icon: "ClipboardList", desc: "ตรวจสอบรายงานการปฏิบัติงาน", workspace: "executive", displayIn: "dashboard", permissionKey: "manage_attendance_work_reports", createdAt: new Date() },
      { title: "อนุมัติการลางาน", href: "/leave-approvals", icon: "CalendarCheck", desc: "อนุมัติการลา", workspace: "executive", displayIn: "dashboard", permissionKey: "manage_attendance_leave_approvals", createdAt: new Date() },
      { title: "คำร้องการนิเทศ", href: "/dashboard/supervision/requests", icon: "ShieldCheck", desc: "อนุมัติผลการนิเทศ", workspace: "executive", displayIn: "dashboard", permissionKey: "manage_supervision_requests", createdAt: new Date() },

      // 6. Super Admin Workspace
      { title: "จัดการสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ", href: "/dashboard/permissions", icon: "Shield", desc: "จัดการสิทธิ์ระบบ", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_system", createdAt: new Date() },
      { title: "จัดการสิทธิ์บุคลากร", href: "/manage-roles", icon: "UserCog", desc: "จัดการบทบาท", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_roles_advanced", createdAt: new Date() },
      { title: "ตั้งค่าระบบลงเวลา", href: "/attendance-settings", icon: "Settings", desc: "ตั้งค่าเวลาเข้าทำงาน", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_attendance_settings", createdAt: new Date() },
      { title: "ตั้งค่าเวลาเข้าแถว", href: "/dashboard/flagpole-settings", icon: "Settings", desc: "ตั้งค่าเวลาเข้าแถว", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_flagpole_settings", createdAt: new Date() },
      { title: "ส่งข้อความแจ้งเตือน", href: "/broadcast-notification", icon: "Bell", desc: "ส่งแจ้งเตือนทั้งระบบ", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_broadcast_notification", createdAt: new Date() },
      { title: "จัดการเนื้อหาหน้าหลัก", href: "/dashboard/manage-home", icon: "Globe", desc: "จัดการหน้า Landing", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_home", createdAt: new Date() },
      { title: "จัดการเมนู (Navbar)", href: "/dashboard/navbar", icon: "Navigation", desc: "ตั้งค่าเมนูบาร์บน", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_navbar", createdAt: new Date() },
      { title: "ระบบจัดการหนังสือ (Books)", href: "/dashboard/books", icon: "BookOpen", desc: "ระบบ E-Book", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_system", createdAt: new Date() },
      { title: "จัดการเนื้อหาหน้าเว็บ (Pages)", href: "/dashboard/pages", icon: "FileText", desc: "แก้ไขเนื้อหา Pages", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_pages", createdAt: new Date() },
      { title: "แก้ไขข้อมูลการลงเวลา", href: "/dashboard/data-management", icon: "ClipboardList", desc: "แก้ไขเวลาเข้า-ออกงาน", workspace: "superadmin", displayIn: "dashboard", permissionKey: "manage_attendance_data", createdAt: new Date() },

      // 7. Manuals
      { title: "คู่มือระบบ Gate Pass", href: "/manual/gate-pass", icon: "BookOpen", desc: "คู่มือการใช้งาน Gate Pass", workspace: "staff", displayIn: "dashboard", permissionKey: "student_dashboard", createdAt: new Date() }
    ];

    const result = await db.collection("custom_menus").insertMany(menus);
    console.log("Inserted custom menus:", result.insertedCount);

  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
