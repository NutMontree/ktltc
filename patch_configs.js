const { MongoClient } = require('mongodb');
const uri = 'mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    
    const newCategories = [
      {
        id: 'mental_health',
        name: 'จิตพิสัย',
        points: 20,
        cannotDeduct: true,
        required: true,
        description: 'การประเมินจิตพิสัยและความประพฤติ',
      },
      {
        id: 'class_work',
        name: 'ระหว่างเรียน',
        points: 20,
        cannotDeduct: false,
        required: false,
        description: 'คะแนนเก็บระหว่างเรียน',
      },
      {
        id: 'midterm_exam',
        name: 'กลางภาค',
        points: 10,
        cannotDeduct: true,
        required: true,
        description: 'การสอบกลางภาค',
      },
      {
        id: 'end_of_chapter_exam',
        name: 'เก็บท้ายบท',
        points: 20,
        cannotDeduct: true,
        required: true,
        description: 'การสอบท้ายบท',
      },
      {
        id: 'project',
        name: 'โปรเจครายวิชา',
        points: 10,
        cannotDeduct: false,
        required: false,
        description: 'โปรเจครายวิชา',
      },
      {
        id: 'final_exam',
        name: 'ปลายภาค',
        points: 20,
        cannotDeduct: true,
        required: true,
        description: 'การสอบปลายภาค',
      },
    ];

    const result = await db.collection('dve_grading_configs').updateMany(
      {},
      { $set: { categories: newCategories } }
    );
    console.log('Updated configs:', result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
