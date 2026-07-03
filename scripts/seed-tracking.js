const { MongoClient, ObjectId } = require('mongodb');

async function seedTracking() {
  const uri = "mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');

    // 1. Get 5 random students
    const students = await db.collection('users').find({ role: 'student' }).limit(5).toArray();
    
    if (students.length === 0) {
      console.log("No students found in DB to mock tracking for.");
      return;
    }

    const campusLat = 14.754043;
    const campusLng = 104.65807;

    console.log(`Creating mock active sessions for ${students.length} students...`);

    // 2. Clear old active sessions just in case
    await db.collection('off_campus_sessions').deleteMany({ status: 'ACTIVE' });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      const randomLat = campusLat + (Math.random() - 0.5) * 0.02; 
      const randomLng = campusLng + (Math.random() - 0.5) * 0.02;

      // Update student's currentLocation
      await db.collection('users').updateOne(
        { _id: student._id },
        { 
          $set: { 
            currentLocation: {
              latitude: randomLat,
              longitude: randomLng,
              updatedAt: new Date()
            }
          } 
        }
      );

      // Create ACTIVE session
      await db.collection('off_campus_sessions').insertOne({
        studentId: student._id,
        scannedOutAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last 1 hour
        status: 'ACTIVE',
        teacherId: new ObjectId() // Fake teacher
      });

      console.log(`Mocked tracking for ${student.name || student.username} at [${randomLat}, ${randomLng}]`);
    }

    console.log("Mock data generated successfully! The map should now show these students.");

  } finally {
    await client.close();
  }
}

seedTracking();
