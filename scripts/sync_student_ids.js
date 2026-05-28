const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const users = db.collection('users');

    console.log('Starting migration to synchronize studentId and studentIdNum...');

    // Find all students
    const cursor = users.find({
      role: { $regex: 'student|นักเรียน|นักศึกษา', $options: 'i' }
    });

    let updatedCount = 0;
    
    while (await cursor.hasNext()) {
      const student = await cursor.next();
      
      const hasStudentId = !!student.studentId;
      const hasStudentIdNum = !!student.studentIdNum;

      if (hasStudentId && !hasStudentIdNum) {
        await users.updateOne(
          { _id: student._id },
          { $set: { studentIdNum: student.studentId } }
        );
        updatedCount++;
      } else if (!hasStudentId && hasStudentIdNum) {
        await users.updateOne(
          { _id: student._id },
          { $set: { studentId: student.studentIdNum } }
        );
        updatedCount++;
      }
    }

    console.log(`Migration complete! Successfully updated ${updatedCount} student records.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

run();
