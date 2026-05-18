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
 * คำนวณเลื่อนชั้นปีของนักเรียน นักศึกษา ตามจำนวนปีที่ต่างกัน
 * ปวช 1 -> ปวช 2 -> ปวช 3 -> จบการศึกษา
 * ปวส 1 -> ปวส 2 -> จบการศึกษา
 */
export function promoteAcademicLevel(level: string, yearsDiff: number): { newLevel: string; newStatus?: string } {
  if (yearsDiff <= 0) return { newLevel: level };

  let currentLevel = level;
  let newStatus: string | undefined;

  for (let i = 0; i < yearsDiff; i++) {
    if (currentLevel === "ปวช 1") {
      currentLevel = "ปวช 2";
    } else if (currentLevel === "ปวช 2") {
      currentLevel = "ปวช 3";
    } else if (currentLevel === "ปวช 3" || currentLevel === "จบการศึกษา") {
      currentLevel = "จบการศึกษา";
      newStatus = "จบการศึกษา";
    } else if (currentLevel === "ปวส 1") {
      currentLevel = "ปวส 2";
    } else if (currentLevel === "ปวส 2" || currentLevel === "จบการศึกษา") {
      currentLevel = "จบการศึกษา";
      newStatus = "จบการศึกษา";
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
