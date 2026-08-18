const { MongoClient } = require('mongodb');
async function run() {
  const c = await MongoClient.connect('mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin');
  const db = c.db();
  const quizzes = await db.collection('dve_quizzes').find({}).limit(5).toArray();
  const submissions = await db.collection('dve_quiz_submissions').find({}).limit(5).toArray();
  const attendances = await db.collection('dve_attendances').find({ studentName: /ณัฐธิชา/ }).limit(20).toArray();
  console.log("QUIZZES:", quizzes.map(q => q.title));
  console.log("SUBMISSIONS:", submissions.map(s => ({ title: s.quizTitle, score: s.score })));
  console.log("ATTENDANCES:", attendances.filter(a => a.score).map(a => ({ title: a.unitTitle, score: a.score })));
  c.close();
}
run();
