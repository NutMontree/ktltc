const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

// Valid department values for students (from DEPARTMENT_GROUPS "5. แผนกวิชา")
const VALID_STUDENT_DEPARTMENTS = [
  "แผนกวิชาช่างยนต์",
  "แผนกวิชาช่างกลโรงงาน",
  "แผนกวิชาช่างเชื่อมโลหะ",
  "แผนกวิชาช่างไฟฟ้ากำลัง",
  "แผนกวิชาช่างอิเล็กทรอนิกส์",
  "แผนกวิชาช่างเทคนิคพื้นฐาน",
  "แผนกวิชาช่างก่อสร้าง",
  "แผนกวิชาการบัญชี",
  "แผนกวิชาการตลาด",
  "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "แผนกวิชาการโรงแรม",
  "แผนกวิชาสามัญสัมพันธ์",
  "แผนกวิชายานยนต์ไฟฟ้า",
  "แผนกวิชาการตลาด/โลจิสติก์",
  "การจัดการสำนักงานดิจิทัล",
  "การจัดการโลจิสติกส์และซัพพลายเชน"
];

// Mapping from old/wrong values to correct values
const DEPARTMENT_FIX_MAP = {
  "ช่างยนต์": "แผนกวิชาช่างยนต์",
  "ช่างกลโรงงาน": "แผนกวิชาช่างกลโรงงาน",
  "ช่างเชื่อมโลหะ": "แผนกวิชาช่างเชื่อมโลหะ",
  "ช่างไฟฟ้ากำลัง": "แผนกวิชาช่างไฟฟ้ากำลัง",
  "ช่างอิเล็กทรอนิกส์": "แผนกวิชาช่างอิเล็กทรอนิกส์",
  "ช่างเทคนิคพื้นฐาน": "แผนกวิชาช่างเทคนิคพื้นฐาน",
  "ช่างก่อสร้าง": "แผนกวิชาช่างก่อสร้าง",
  "การบัญชี": "แผนกวิชาการบัญชี",
  "การตลาด": "แผนกวิชาการตลาด",
  "เทคโนโลยีธุรกิจดิจิทัล": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "การโรงแรม": "แผนกวิชาการโรงแรม",
  "สามัญสัมพันธ์": "แผนกวิชาสามัญสัมพันธ์",
  "ยานยนต์ไฟฟ้า": "แผนกวิชายานยนต์ไฟฟ้า",
  "คอมพิวเตอร์ธุรกิจ": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "แผนกคอมพิวเตอร์ธุรกิจ": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "แผนกวิชาคอมพิวเตอร์ธุรกิจ": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "โลจิสติกส์": "การจัดการโลจิสติกส์และซัพพลายเชน",
  "โลจิสติก์": "แผนกวิชาการตลาด/โลจิสติก์",
  "แผนกวิชาช่างอิเล็กทรอนิกส": "แผนกวิชาช่างอิเล็กทรอนิกส์",
  "งานการเงิน": "แผนกวิชาการบัญชี",
  "วิทยาลัยเทคนิคกันทรลักษ์": "",
  "แผนการบัญชี": "แผนกวิชาการบัญชี",
  "แผนกการบัญชี": "แผนกวิชาการบัญชี",
  "แผนกการตลาด": "แผนกวิชาการตลาด",
  "แผนก เทคนิคยานยนต์ไฟฟ้า": "แผนกวิชายานยนต์ไฟฟ้า",
  "แผนกเทคนิคยานยนต์ไฟฟ้า": "แผนกวิชายานยนต์ไฟฟ้า",
  "แผนกวิชาเมคคาทรอนิกส์และหุ่นยนต์": "แผนกวิชาช่างอิเล็กทรอนิกส์",
  "แผนกวิชาช่างโยธา": "แผนกวิชาช่างก่อสร้าง",
  "แผนกวิชาผู้จัดการแห่งรัฐ": "แผนกวิชาการตลาด",
  "แผนอิเล็กทรอนิกส์": "แผนกวิชาช่างอิเล็กทรอนิกส์",
  "แผนกไฟฟ้ากำลัง": "แผนกวิชาช่างไฟฟ้ากำลัง",
  "แผนกวิชาช่างกลโรงงาny": "แผนกวิชาช่างกลโรงงาน",
  "แผนกการโรงแรม": "แผนกวิชาการโรงแรม",
  "แผนกวิชาจัดการสำนักงานดิจิทัล/นักศึกษา": "การจัดการสำนักงานดิจิทัล",
  "แผนกวิชาจัดการสำนักงานดิจิทัล": "การจัดการสำนักงานดิจิทัล",
  "แผนการจัดการสำนักงานดิจิทัล/นักศึกษา": "การจัดการสำนักงานดิจิทัล",
  "แผนกการจัดการสำนักงานดิจิทัล": "การจัดการสำนักงานดิจิทัล",
  "แผนกวิชาการจัดการโลจิสติกส์และซัพพลายเชน": "การจัดการโลจิสติกส์และซัพพลายเชน",
  "แผนกจัดการโลจิสติกส์และซัพพลายเชน": "การจัดการโลจิสติกส์และซัพพลายเชน",
  "แผนตลาด/โลจิสติก์": "แผนกวิชาการตลาด/โลจิสติก์",
  "แผนกตลาด/โลจิสติก์": "แผนกวิชาการตลาด/โลจิสติก์",
  "แผนเทคนิคยานยนต์ไฟฟ้า": "แผนกวิชายานยนต์ไฟฟ้า",
  "แผนกวิชาการตลาด/นักศึกษา": "แผนกวิชาการตลาด",
  "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล ": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "แผนเทคโนโลยีธุรกิจดิจิทัล": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
  "เทคโนโลยีธุรกิจดิจิทัล ": "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = db.collection('users');
  
  // Find all students with wrong department values
  const studentRoles = ["student", "นักเรียน/นักศึกษา", "นักเรียน", "นักศึกษา"];
  const students = await users.find({
    role: { $in: studentRoles },
    department: { $nin: [...VALID_STUDENT_DEPARTMENTS, "", null, undefined, "ไม่มีสังกัด"] }
  }).toArray();
  
  console.log(`Found ${students.length} students with non-standard department values`);
  
  // Also check student_care collection
  const studentCare = db.collection('student_cares');
  const careRecords = await studentCare.find({
    department: { $nin: [...VALID_STUDENT_DEPARTMENTS, "", null, undefined] }
  }).toArray();
  
  console.log(`Found ${careRecords.length} student care records with non-standard department values`);
  
  // Show unique wrong department values
  const wrongDepts = new Set();
  students.forEach(s => wrongDepts.add(s.department));
  careRecords.forEach(r => wrongDepts.add(r.department));
  
  console.log("\nUnique wrong department values:");
  wrongDepts.forEach(d => {
    const fix = DEPARTMENT_FIX_MAP[d];
    console.log(`  "${d}" => "${fix || '(no mapping - needs manual check)'}" `);
  });
  
  // Fix users
  let fixedUsers = 0;
  for (const student of students) {
    // Try exact match first
    let correctDept = DEPARTMENT_FIX_MAP[student.department];
    
    // If no exact match, try partial match
    if (!correctDept && student.department) {
      const dept = student.department.trim();
      // Try to find by substring match
      for (const validDept of VALID_STUDENT_DEPARTMENTS) {
        if (validDept.includes(dept) || dept.includes(validDept.replace("แผนกวิชา", ""))) {
          correctDept = validDept;
          break;
        }
      }
    }
    
    if (correctDept !== undefined) {
      await users.updateOne({ _id: student._id }, { $set: { department: correctDept } });
      fixedUsers++;
    }
  }
  console.log(`\nFixed ${fixedUsers} user records`);
  
  // Fix student care records
  let fixedCare = 0;
  for (const record of careRecords) {
    let correctDept = DEPARTMENT_FIX_MAP[record.department];
    
    if (!correctDept && record.department) {
      const dept = record.department.trim();
      for (const validDept of VALID_STUDENT_DEPARTMENTS) {
        if (validDept.includes(dept) || dept.includes(validDept.replace("แผนกวิชา", ""))) {
          correctDept = validDept;
          break;
        }
      }
    }
    
    if (correctDept !== undefined) {
      await studentCare.updateOne({ _id: record._id }, { $set: { department: correctDept } });
      fixedCare++;
    }
  }
  console.log(`Fixed ${fixedCare} student care records`);
  
  // Show remaining unfixed
  const remaining = await users.find({
    role: { $in: studentRoles },
    department: { $nin: [...VALID_STUDENT_DEPARTMENTS, "", null, undefined, "ไม่มีสังกัด"] }
  }).toArray();
  
  if (remaining.length > 0) {
    console.log(`\n${remaining.length} students still have non-standard departments:`);
    const remainDepts = {};
    remaining.forEach(s => {
      remainDepts[s.department] = (remainDepts[s.department] || 0) + 1;
    });
    Object.entries(remainDepts).forEach(([dept, count]) => {
      console.log(`  "${dept}" - ${count} students`);
    });
  } else {
    console.log("\nAll student departments are now correct!");
  }
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
