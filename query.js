require("dotenv").config({ path: ".env" });
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    // Simulate the API route logic
    const subjectId = "6a2f5d99b0fb9ffc3345c290"; // From previous query
    const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
    
    const grades = await db.collection("dve_student_grades").find({ subjectId }).toArray();
    const studentMap = new Map();
    grades.forEach(g => {
        const mapKey = g.studentId || `manual_${g._id.toString()}`;
        studentMap.set(mapKey, { ...g, studentId: g.studentId });
    });
    console.log("Grades found:", grades.length);

    const stdClass = (n) => String(n||'').trim().replace(/[\s\.-]+/g, '.');
    const parseAllowed = (v) => {
      if (Array.isArray(v)) return Array.from(new Set(v.map(i => stdClass(i)).filter(Boolean)));
      if (typeof v === 'string') return Array.from(new Set(v.split(',').map(i => stdClass(i)).filter(Boolean)));
      return [];
    };

    const allowedGroups = parseAllowed(subject.allowedClassGroups);
    const resolveGrp = (student) => {
      const CLASS_GROUP_FIELDS = ["classGroupId", "groupCode", "classroomName"];
      for (const field of CLASS_GROUP_FIELDS) {
        const value = student[field];
        if (value && String(value).trim()) return stdClass(String(value).trim());
      }
      return "";
    }

    if (allowedGroups.length > 0) {
        const allStudents = await db.collection("users").find({ role: "student" }).toArray();
        let addedCount = 0;
        allStudents.forEach(student => {
          const studentGroup = resolveGrp(student);
          if (studentGroup && allowedGroups.includes(studentGroup)) {
            const studentIdStr = student._id.toString();
            let exists = false;
            for (const key of studentMap.keys()) {
              if (String(key) === studentIdStr) { exists = true; break; }
            }
            if (!exists) {
              addedCount++;
              studentMap.set(studentIdStr, { studentId: studentIdStr, studentName: student.name });
            }
          }
        });
        console.log("Missing students added:", addedCount);
    }
    
    console.log("Total students in map:", studentMap.size);

  } finally {
    await client.close();
  }
}

main().catch(console.error);
