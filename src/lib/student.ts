/**
 * คำนวณปีการศึกษาปัจจุบัน (Academic Year) 
 * ปีการศึกษาจะเริ่มต้นวันที่ 1 เมษายน ของทุกปี
 */
export function getStudentAcademicYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = มกราคม, 3 = เมษายน
  // หากเป็นเดือนเมษายน (3) เป็นต้นไป ให้เป็นปีปัจจุบัน หากก่อนหน้านั้นให้เป็นปีก่อนหน้า
  return month >= 3 ? year : year - 1;
}

/**
 * Normalize รูปแบบชั้นปีให้เป็นมาตรฐาน (ไม่มีจุด)
 * รองรับทั้ง "ปวช. 1" และ "ปวช 1" ให้กลายเป็น "ปวช 1"
 */
export function normalizeAcademicLevel(level: string): string {
  if (!level) return level;
  return level
    .replace(/ปวช\.\s*/g, "ปวช ")
    .replace(/ปวส\.\s*/g, "ปวส ")
    .trim();
}

/**
 * คำนวณเลื่อนชั้นปีของนักเรียน นักศึกษา ตามจำนวนปีที่ต่างกัน
 * ปวช 1 -> ปวช 2 -> ปวช 3 -> จบการศึกษา
 * ปวส 1 -> ปวส 2 -> จบการศึกษา
 */
export function promoteAcademicLevel(level: string, yearsDiff: number): { newLevel: string; newStatus?: string } {
  if (yearsDiff <= 0) return { newLevel: level };

  // Normalize format ก่อนทำการเลื่อนชั้น (รองรับทั้งมีจุดและไม่มีจุด)
  let currentLevel = normalizeAcademicLevel(level);
  let newStatus: string | undefined;

  for (let i = 0; i < yearsDiff; i++) {
    if (currentLevel === "ปวช 1") {
      currentLevel = "ปวช 2";
    } else if (currentLevel === "ปวช 2") {
      currentLevel = "ปวช 3";
    } else if (currentLevel === "ปวช 3") {
      currentLevel = "จบการศึกษา";
      newStatus = "จบการศึกษา";
    } else if (currentLevel === "ปวส 1") {
      currentLevel = "ปวส 2";
    } else if (currentLevel === "ปวส 2") {
      currentLevel = "จบการศึกษา";
      newStatus = "จบการศึกษา";
    } else if (currentLevel === "จบการศึกษา") {
      // ถ้าจบแล้ว ให้อยู่ที่จบการศึกษา
      newStatus = "จบการศึกษา";
      break;
    }
  }

  return { newLevel: currentLevel, newStatus };
}

/**
 * ฟังก์ชันช่วยตรวจสอบและเลื่อนชั้นปีของนักเรียนในระดับ Database
 */
export async function checkAndPromoteStudent(db: any, user: any): Promise<any> {
  if (user.role === "student" && user.academicLevel && user.studentStatus === "กำลังศึกษา") {
    const registeredYear = user.lastPromotedYear || getStudentAcademicYear(user.createdAt || new Date());
    const currentYear = getStudentAcademicYear(new Date());
    
    if (currentYear > registeredYear) {
      const yearsDiff = currentYear - registeredYear;
      const { newLevel, newStatus } = promoteAcademicLevel(user.academicLevel, yearsDiff);

      const updateFields: any = {
        academicLevel: newLevel,
        lastPromotedYear: currentYear,
        updatedAt: new Date()
      };

      if (newStatus) {
        updateFields.studentStatus = newStatus;
      }

      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: updateFields }
      );

      // คืนค่าออบเจ็กต์ผู้ใช้ที่อัปเดตแล้ว
      return {
        ...user,
        ...updateFields
      };
    }
  }
  return user;
}
