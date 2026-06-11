const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');

    // Find all subjects
    const subjects = await db.collection('dve_subjects').find().toArray();
    console.log(`Found ${subjects.length} subjects.`);
    if (subjects.length > 0) {
      console.log('Sample subject ID:', subjects[0]._id.toString(), 'type:', typeof subjects[0]._id);
    }

    // Find all attendances
    const attendances = await db.collection('dve_attendances').find().toArray();
    console.log(`Found ${attendances.length} attendances.`);
    if (attendances.length > 0) {
      console.log('Sample attendance subjectId:', attendances[0].subjectId, 'type:', typeof attendances[0].subjectId);
    }

    // Find all grades
    const grades = await db.collection('dve_student_grades').find().toArray();
    console.log(`Found ${grades.length} grades.`);
    
    // Check if attendances match any subject
    if (subjects.length > 0 && attendances.length > 0) {
      const match1 = attendances.filter(a => a.subjectId === subjects[0]._id.toString());
      const match2 = attendances.filter(a => a.subjectId === subjects[0]._id);
      console.log(`String match count: ${match1.length}`);
      console.log(`ObjectId match count: ${match2.length}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
