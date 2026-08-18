const { MongoClient } = require('mongodb');
async function run() {
  const c = await MongoClient.connect('mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin');
  const db = c.db();
  const quizzes = await db.collection('dve_quizzes').find({}).toArray();
  const submissions = await db.collection('dve_quiz_submissions').find({}).toArray();
  let updated = 0;
  for (const sub of submissions) {
    const quiz = quizzes.find(q => q._id.toString() === sub.quizId);
    if (!quiz) continue;
    const atts = await db.collection('dve_attendances').find({ studentId: sub.studentId, subjectId: quiz.subjectId, score: sub.score }).toArray();
    for (const att of atts) {
      if (!att.unitTitle || !att.unitTitle.includes(quiz.title)) {
        const newTitle = (att.unitTitle ? att.unitTitle + ' - ' : '') + quiz.title;
        await db.collection('dve_attendances').updateOne({ _id: att._id }, { $set: { unitTitle: newTitle } });
        updated++;
      }
    }
  }
  console.log('Updated', updated, 'attendances');
  c.close();
}
run();
