/**
 * ไฟล์นี้ใช้สำหรับกำหนดโครงสร้างข้อมูลของผู้ใช้งาน (User Model) 
 * เนื่องจากโปรเจกต์นี้ใช้ Native MongoDB Driver จึงไม่มี Schema เหมือน Mongoose
 * แต่ใช้ไฟล์นี้เป็นเอกสาร (Documentation) และกำหนดค่าคงที่ที่เกี่ยวข้องกับผู้ใช้
 * 
 * ความเชื่อมโยง: 
 * - ใช้ใน API Routes (src/app/api/auth/*) สำหรับการลงทะเบียนและเข้าสู่ระบบ
 * - ใช้ใน Middleware สำหรับการเช็คสิทธิ์ (Role-based Access Control)
 * - ใช้ในส่วนของ Admin Dashboard สำหรับการจัดการผู้ใช้งาน
 */

/**
 * รายละเอียดฟิลด์ข้อมูลใน MongoDB (users collection):
 * - username: ชื่อผู้ใช้งานสำหรับเข้าสู่ระบบ (string)
 * - email: อีเมลของผู้ใช้งาน (string, ต้องไม่ซ้ำกัน)
 * - password: รหัสผ่านที่ผ่านการเข้ารหัส (Hashed string)
 * - name: ชื่อ-นามสกุลจริง (string)
 * - role: บทบาทหน้าที่ในระบบ (enum ตาม UserRoles)
 * - department: แผนก/ฝ่าย (string)
 * - position: ตำแหน่งงาน (string) เช่น หัวหน้าแผนกวิชา, ครู คศ.3 (Optional)
 * - faction: ฝ่ายที่สังกัด (string) เช่น งานวิทยบริการและห้องสมุด (Optional)
 * - description: คำอธิบายเพิ่มเติม (string) เช่น พนักงานราชการ ครู (Optional)
 * - image: URL รูปโปรไฟล์ (string)
 * - coverImage: URL รูปหน้าปก (string)
 * - deviceId: ไอดีเครื่องที่ใช้ลงชื่อเข้าใช้ (string)
 * - isActive: สถานะการใช้งานบัญชี (boolean)
 * - addressHouse: บ้านเลขที่ หมู่ที่ ซอย (string)
 * - addressVillage: อาคาร หมู่บ้าน ถนน (string)
 * - addressSubdistrict: ตำบล/แขวง (string)
 * - addressDistrict: อำเภอ/เขต (string)
 * - addressProvince: จังหวัด (string)
 * - addressZipcode: รหัสไปรษณีย์ (string)
 * - positionNumber: เลขที่ตำแหน่ง (string)
 * - affiliation: สังกัด เช่น กองการศึกษา ศาสนาและวัฒนธรรม โรงเรียน (string)
 * - govStartDate: วันเดือนปีที่เริ่มเข้ารับราชการ (string)
 * - retirementDate: วันที่ครบเกษียณอายุ (string)
 * - retirementFiscalYear: เกษียณปีงบประมาณ (string)
 * - respDeptHead: หน้าที่รับผิดชอบ เช่น หัวหน้าแผนก (string)
 * - respWorkHead: หน้าที่รับผิดชอบ เช่น หัวหน้างาน (string)
 * - respOther: หน้าที่รับผิดชอบอื่น เช่น ผู้ช่วยงาน (string)
 * - createdAt: วันที่สร้างบัญชี (Date)
 * - updatedAt: วันที่อัปเดตข้อมูลล่าสุด (Date)
 */

/**
 * รายการบทบาท (Roles) ทั้งหมดในระบบ
 * ใช้สำหรับตรวจสอบสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ
 * โดยเรียงลำดับจากสิทธิ์สูงสุด (super_admin) ไปยังสิทธิ์ทั่วไป (user)
 */
export const UserRoles = [
  "super_admin",           // ผู้ดูแลระบบสูงสุด (จัดการได้ทุกอย่าง)
  "director",              // ผู้อำนวยการ
  "deputy_resource",       // รองผู้อำนวยการฝ่ายบริหารทรัพยากร
  "deputy_strategy",       // รองผู้อำนวยการฝ่ายแผนงานและความร่วมมือ
  "deputy_academic",       // รองผู้อำนวยการฝ่ายวิชาการ
  "deputy_student_affairs",// รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียนนักศึกษา
  "hr",                    // เจ้าหน้าที่บุคคล (จัดการข้อมูลบุคลากร)
  "admin",                 // ผู้ดูแลระบบทั่วไป
  "general",               // เจ้าหน้าที่ทั่วไป
  "editor",                // ผู้แก้ไขเนื้อหา (จัดการข่าวสาร/คอนเทนต์)
  "user"                   // ผู้ใช้งานทั่วไป (ครู/บุคลากร)
];

