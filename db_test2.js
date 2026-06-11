const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb://nut:Nut29122539@192.168.6.26:27017/ktltc_db?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const configs = await db.collection('dve_grading_configs').find().sort({_id: -1}).limit(3).toArray();
    console.log('Latest grading configs:');
    for (const c of configs) {
      const atts = await db.collection('dve_attendances').find({ subjectId: c.subjectId }).toArray();
      const grades = await db.collection('dve_student_grades').find({ subjectId: c.subjectId }).toArray();
      console.log(`- Subject ID: ${c.subjectId}, Attendances: ${atts.length}, Grades: ${grades.length}`);
    }
  } catch(err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
