const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://allmaster:allmaster@panyatouch.9qicf.mongodb.net/?retryWrites=true&w=majority&appName=panyatouch';

async function checkAndSeed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    
    // Check if there are any students
    const studentCount = await db.collection('users').countDocuments({ role: 'student' });
    console.log(`Current student count in DB: ${studentCount}`);

    const existingStudents = await db.collection('users').find({ role: 'student' }).limit(3).toArray();
    console.log('Existing students samples:', JSON.stringify(existingStudents, null, 2));

    if (studentCount === 0) {
      console.log('No students found. Seeding a mock student for testing...');
      const mockStudent = {
        username: 'student_test',
        password: '$2a$12$somehashedpasswordherevalue',
        name: 'สมชาย รักเรียน',
        email: 'somchai.rak@ktltc.ac.th',
        phone: '0812345678',
        lineId: 'somchai_line',
        department: 'คอมพิวเตอร์ธุรกิจ',
        role: 'student',
        isActive: true,
        citizenId: '3120500123456',
        classGroupId: '652090101',
        academicLevel: 'ปวช 1',
        studentStatus: 'กำลังศึกษา',
        learnerType: 'ทวิภาคี',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const res = await db.collection('users').insertOne(mockStudent);
      console.log(`Mock student seeded successfully with ID: ${res.insertedId}`);
    }
  } catch (err) {
    console.error('DB Operation Error:', err);
  } finally {
    await client.close();
  }
}

checkAndSeed();
