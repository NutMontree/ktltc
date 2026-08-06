"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var uri = "mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin";
var client = new mongodb_1.MongoClient(uri);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var db, menus, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 7]);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    console.log("Connected to MongoDB!");
                    db = client.db("ktltc_db");
                    // Clear existing custom menus to avoid duplicates
                    return [4 /*yield*/, db.collection("custom_menus").deleteMany({})];
                case 2:
                    // Clear existing custom menus to avoid duplicates
                    _a.sent();
                    console.log("Cleared existing custom menus.");
                    menus = [
                        // 1. Sidebar Menus
                        {
                            title: "ระบบติดตาม PDCA",
                            href: "/pdca",
                            icon: "Activity",
                            desc: "ระบบบริหารจัดการคุณภาพ",
                            workspace: "staff",
                            displayIn: "both",
                            permissionKey: "custom_pdca",
                            createdAt: new Date(),
                        },
                        {
                            title: "บันทึกข้อความทั่วไป",
                            href: "/GeneralMemoPage",
                            icon: "FileText",
                            desc: "ระบบสารบรรณอิเล็กทรอนิกส์",
                            workspace: "staff",
                            displayIn: "both",
                            permissionKey: "custom_memo",
                            createdAt: new Date(),
                        },
                        {
                            title: "Chart Analytics",
                            href: "/chart",
                            icon: "BarChart2",
                            desc: "วิเคราะห์ข้อมูลสถิติ",
                            workspace: "staff",
                            displayIn: "both",
                            permissionKey: "custom_chart",
                            createdAt: new Date(),
                        },
                        {
                            title: "แก้ไขหัวข้อฟอร์ม",
                            href: "/form-editor",
                            icon: "Edit",
                            desc: "แก้ไขฟอร์มแบบสอบถาม",
                            workspace: "staff",
                            displayIn: "both",
                            permissionKey: "custom_form_editor",
                            createdAt: new Date(),
                        },
                        {
                            title: "ตั้งค่าระบบภายใน",
                            href: "/internal-form-editor",
                            icon: "Settings",
                            desc: "ตั้งค่าระบบภายใน",
                            workspace: "staff",
                            displayIn: "both",
                            permissionKey: "custom_internal_editor",
                            createdAt: new Date(),
                        },
                        // 2. Student Workspace
                        {
                            title: "เช็คชื่อเข้าแถวหน้าเสาธง",
                            href: "/student/flagpole",
                            icon: "Clock",
                            desc: "ระบบเช็คชื่อด้วยพิกัด GPS",
                            workspace: "student",
                            displayIn: "dashboard",
                            permissionKey: "student_dashboard",
                            createdAt: new Date(),
                        },
                        {
                            title: "ศูนย์การศึกษาระบบทวิภาคี (DVE)",
                            href: "/dashboard/dve/student",
                            icon: "BookOpen",
                            desc: "ระบบบันทึกสมุดฝึกงาน",
                            workspace: "student",
                            displayIn: "dashboard",
                            permissionKey: "access_dve_student",
                            createdAt: new Date(),
                        },
                        {
                            title: "แชท / กล่องข้อความ",
                            href: "/dashboard/chat",
                            icon: "MessageSquare",
                            desc: "ติดต่อสื่อสารกับอาจารย์",
                            workspace: "student",
                            displayIn: "dashboard",
                            permissionKey: "student_dashboard",
                            createdAt: new Date(),
                        },
                        // 3. Teacher Workspace
                        {
                            title: "ข้อมูลนักเรียนในที่ปรึกษา / แผนก",
                            href: "/teacher/students",
                            icon: "Users",
                            desc: "ระบบตรวจสอบรายชื่อประจำแผนก",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_teacher_students",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบสแกนเข้า-ออก (Gate)",
                            href: "/teacher/gate-scanner",
                            icon: "ScanLine",
                            desc: "ติดตามนักเรียนออกนอกสถานศึกษา หรือกลับเข้าวิทยาลัย",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_gate_scanner",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบติดตามตำแหน่ง (GPS)",
                            href: "/teacher/tracking",
                            icon: "Navigation",
                            desc: "แสดงพิกัดนักเรียนแบบ Real-time",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_gps_tracking",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบนิเทศนักศึกษาฝึกงาน",
                            href: "/dashboard/supervision",
                            icon: "ClipboardList",
                            desc: "บันทึกข้อมูลการนิเทศ",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_dve_teacher",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการแผนการสอน",
                            href: "/dashboard/director/lesson-plans",
                            icon: "FileText",
                            desc: "อัปโหลดแผนการสอน",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_lesson_plans",
                            createdAt: new Date(),
                        },
                        {
                            title: "ประเมินผลการปฏิบัติงาน / DPA",
                            href: "/dashboard/director/dpa-evaluation",
                            icon: "ShieldCheck",
                            desc: "ระบบประเมินครู DPA",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_dpa_evaluation",
                            createdAt: new Date(),
                        },
                        {
                            title: "ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)",
                            href: "/dashboard/director/plc",
                            icon: "Users",
                            desc: "บันทึกชั่วโมง PLC",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_plc",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบรายงานการปฏิบัติงาน",
                            href: "/work-reports",
                            icon: "ClipboardList",
                            desc: "ตรวจสอบรายงานการปฏิบัติงาน",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_work_reports",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบดูแลช่วยเหลือนักเรียน",
                            href: "/dashboard/director/student-care",
                            icon: "ClipboardList",
                            desc: "รายงานการเยี่ยมบ้าน",
                            workspace: "teacher",
                            displayIn: "dashboard",
                            permissionKey: "access_student_care",
                            createdAt: new Date(),
                        },
                        // 4. Staff / HR Workspace
                        {
                            title: "คลังเอกสารดิจิทัล (Drive)",
                            href: "/dashboard/drive",
                            icon: "HardDrive",
                            desc: "ระบบจัดเก็บไฟล์ส่วนกลาง",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_drive",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการข่าวประชาสัมพันธ์",
                            href: "/dashboard/news",
                            icon: "Newspaper",
                            desc: "จัดการข่าวสาร",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_news",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการการเลือกตั้ง",
                            href: "/dashboard/election",
                            icon: "Users",
                            desc: "ดูแลระบบสภานักเรียน",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_elections",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบถาม-ตอบ",
                            href: "/dashboard/questions",
                            icon: "MessageSquare",
                            desc: "ตอบคำถามและข้อร้องเรียน",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_qa",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการข้อมูลการเข้าแถว",
                            href: "/dashboard/flagpole-data-management",
                            icon: "ClipboardList",
                            desc: "แก้ไขพิกัด เวลา เช็คชื่อ",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_flagpole_data",
                            createdAt: new Date(),
                        },
                        {
                            title: "สถิติภาพรวมการเข้าแถว",
                            href: "/dashboard/flagpole-dashboard",
                            icon: "Layers",
                            desc: "รายงานสถิติเข้าแถว",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_flagpole_dashboard",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบรายงานการเข้าแถว",
                            href: "/dashboard/flagpole-reports",
                            icon: "FileText",
                            desc: "พิมพ์รายงานสรุปเข้าแถว",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_flagpole_reports",
                            createdAt: new Date(),
                        },
                        {
                            title: "ตรวจสอบข้อมูลนักเรียน",
                            href: "/student-data-validation",
                            icon: "ShieldCheck",
                            desc: "ตรวจสอบความถูกต้องข้อมูล",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_student_data_validation",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบรายงานการปฏิบัติงาน",
                            href: "/work-reports",
                            icon: "ClipboardList",
                            desc: "พิมพ์รายงานการปฏิบัติงาน",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_work_reports",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบข้อมูล ITA / OIT",
                            href: "/dashboard/ita",
                            icon: "ClipboardList",
                            desc: "แก้ไขตัวชี้วัดความโปร่งใส",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "manage_ita",
                            createdAt: new Date(),
                        },
                        // 5. Executive Workspace
                        {
                            title: "แดชบอร์ดติดตามงานครู",
                            href: "/teacher-dashboard",
                            icon: "Clock",
                            desc: "สถิติติดตามการลงสอน",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "access_teacher_dashboard",
                            createdAt: new Date(),
                        },
                        {
                            title: "ตรวจสอบการจัดการเรียนการสอน",
                            href: "/teacher-verification",
                            icon: "CalendarCheck",
                            desc: "ตรวจสอบการจัดการเรียน",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "access_teacher_verification",
                            createdAt: new Date(),
                        },
                        {
                            title: "แดชบอร์ดการเข้างานบุคลากร",
                            href: "/attendance-dashboard",
                            icon: "CalendarCheck",
                            desc: "สถิติการมาทำงาน",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_dashboard",
                            createdAt: new Date(),
                        },
                        {
                            title: "รายงานการเข้างาน",
                            href: "/attendance-report",
                            icon: "Clock",
                            desc: "ออกรายงานสรุปการทำงาน",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_dashboard",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบรายงานการปฏิบัติงาน",
                            href: "/work-reports",
                            icon: "ClipboardList",
                            desc: "ตรวจสอบรายงานการปฏิบัติงาน",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_work_reports",
                            createdAt: new Date(),
                        },
                        {
                            title: "อนุมัติการลางาน",
                            href: "/leave-approvals",
                            icon: "CalendarCheck",
                            desc: "อนุมัติการลา",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_leave_approvals",
                            createdAt: new Date(),
                        },
                        {
                            title: "คำร้องการนิเทศ",
                            href: "/dashboard/supervision/requests",
                            icon: "ShieldCheck",
                            desc: "อนุมัติผลการนิเทศ",
                            workspace: "executive",
                            displayIn: "dashboard",
                            permissionKey: "manage_supervision_requests",
                            createdAt: new Date(),
                        },
                        // 6. Super Admin Workspace
                        {
                            title: "จัดการสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ",
                            href: "/dashboard/permissions",
                            icon: "Shield",
                            desc: "จัดการสิทธิ์ระบบ",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_system",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการสิทธิ์บุคลากร",
                            href: "/manage-roles",
                            icon: "UserCog",
                            desc: "จัดการบทบาท",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_roles_advanced",
                            createdAt: new Date(),
                        },
                        {
                            title: "ตั้งค่าระบบลงเวลา",
                            href: "/attendance-settings",
                            icon: "Settings",
                            desc: "ตั้งค่าเวลาเข้าทำงาน",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_settings",
                            createdAt: new Date(),
                        },
                        {
                            title: "ตั้งค่าเวลาเข้าแถว",
                            href: "/dashboard/flagpole-settings",
                            icon: "Settings",
                            desc: "ตั้งค่าเวลาเข้าแถว",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_flagpole_settings",
                            createdAt: new Date(),
                        },
                        {
                            title: "ส่งข้อความแจ้งเตือน",
                            href: "/broadcast-notification",
                            icon: "Bell",
                            desc: "ส่งแจ้งเตือนทั้งระบบ",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_broadcast_notification",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการเนื้อหาหน้าหลัก",
                            href: "/dashboard/manage-home",
                            icon: "Globe",
                            desc: "จัดการหน้า Landing",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_home",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการเมนู (Navbar)",
                            href: "/dashboard/navbar",
                            icon: "Navigation",
                            desc: "ตั้งค่าเมนูบาร์บน",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_navbar",
                            createdAt: new Date(),
                        },
                        {
                            title: "ระบบจัดการหนังสือ (Books)",
                            href: "/dashboard/books",
                            icon: "BookOpen",
                            desc: "ระบบ E-Book",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_system",
                            createdAt: new Date(),
                        },
                        {
                            title: "จัดการเนื้อหาหน้าเว็บ (Pages)",
                            href: "/dashboard/pages",
                            icon: "FileText",
                            desc: "แก้ไขเนื้อหา Pages",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_pages",
                            createdAt: new Date(),
                        },
                        {
                            title: "แก้ไขข้อมูลการลงเวลา",
                            href: "/dashboard/data-management",
                            icon: "ClipboardList",
                            desc: "แก้ไขเวลาเข้า-ออกงาน",
                            workspace: "superadmin",
                            displayIn: "dashboard",
                            permissionKey: "manage_attendance_data",
                            createdAt: new Date(),
                        },
                        // 7. Manuals
                        {
                            title: "คู่มือระบบ Gate Pass",
                            href: "/manual/gate-pass",
                            icon: "BookOpen",
                            desc: "คู่มือการใช้งาน Gate Pass",
                            workspace: "staff",
                            displayIn: "dashboard",
                            permissionKey: "student_dashboard",
                            createdAt: new Date(),
                        },
                    ];
                    return [4 /*yield*/, db.collection("custom_menus").insertMany(menus)];
                case 3:
                    result = _a.sent();
                    console.log("Inserted custom menus:", result.insertedCount);
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, client.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
run();
