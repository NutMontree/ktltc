// src/components/Isuvery.ts

// 💡 Interface ที่สมบูรณ์สำหรับข้อมูลแบบสำรวจ
export interface Isuvery {
  [x: string]: string | undefined;
  // 💡 Interface ที่สมบูรณ์สำหรับข้อมูลแบบสำรวจ
  _id: string; // ID สำหรับการอัปเดต API
  // 1. ข้อมูลส่วนตัว
  roomId: string;
  studentId: string;
  fullName: string;
  age: string;
  gender: string; // ชาย/หญิง
  // 2. ที่อยู่ที่ติดต่อได้
  addrNumber: string;
  addrBuilding: string;
  addrMoo: string;
  addrSoi: string;
  addrRoad: string;
  addrSubDistrict: string;
  addrDistrict: string;
  addrProvince: string;
  addrZipCode: string;
  contactTel: string;
  contactEmail: string;
  // 3. ข้อมูลการศึกษา
  homeProvince: string;
  graduationYear: string;
  educationLevel: string; // ปวช./ปวส.
  gpa: string; // เกรดเฉลี่ยสะสม
  // 4. สถานการณ์ทำงานปัจจุบัน
  currentStatus: string; // '1' ไม่ได้ทำงาน / '2' ทำงานแล้ว
  // 4.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
  notWorkingReasonGroup: string; // ศึกษาต่อ, หางานทำไม่ได้, รอฟังคำตอบ, ไม่ประสงค์จะทำงาน
  notWorkingReasonOther: string; // อื่นๆ (โปรดระบุ)
  // 4.2 ข้อมูลเมื่อ "ทำงานแล้ว"
  employmentType: string; // ข้าราชการ, รัฐวิสาหกิจ, พนักงานบริษัท, อื่นๆ
  employmentTypeOther: string; // อื่นๆ (โปรดระบุ)
  jobTitle: string;
  workplaceName: string;
  workplaceAddrNumber: string;
  workplaceAddrMoo: string;
  workplaceAddrSoi: string;
  workplaceAddrRoad: string;
  workplaceAddrSubDistrict: string;
  workplaceAddrDistrict: string;
  workplaceAddrProvince: string;
  workplaceAddrZipCode: string;
  workplaceTel: string;
  // 5. รายได้และลักษณะงาน
  salaryRange: string; // '1', '2', '3', '4', '5'
  salaryRangeOther: string; // อื่นๆ (โปรดระบุ)
  jobMatch: string; // '1' ตรง / '2' ไม่ตรง
  jobSatisfaction: string; // '1' พึงพอใจ / '2' ไม่พึงพอใจ
  // 6. สาเหตุที่ยังไม่ได้ทำงาน (ใช้เฉพาะในกรณีไม่ได้ทำงานและไม่ใช่ศึกษาต่อ)
  unemployedReason: string; // '1', '2', '3', '4'
  unemployedReasonOther: string; // อื่นๆ (โปรดระบุ)
  // 7. การศึกษาต่อ
  furtherStudyIntention: string; // ต้องการศึกษาต่อ / ไม่ต้องการศึกษาต่อ
  furtherStudyLevel: string; // ระดับปริญญาตรี, โท, เอก
  furtherStudyMajor: string; // สาขาเดิม / ระบุสาขา
  furtherStudyMajorDetail: string; // ระบุสาขา (text input)
  furtherStudyReason: string; // '1', '2', '3', '4'
  furtherStudyReasonOther: string; // อื่นๆ (โปรดระบุ)
  // 8. ปัญหาในการหางาน
  jobSearchProblem: string; // ไม่มีปัญหา, 1, 2, ...
  // 9. ข้อเสนอแนะ
  suggestion: string;
}
