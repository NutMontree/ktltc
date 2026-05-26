import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    const submissionId = "6a1523b59c14b485a467aacc";
    console.log("Fetching submission...");
    const submission = await db.collection("dve_quiz_submissions").findOne({
      _id: new pkg.ObjectId(submissionId)
    });

    if (!submission) {
      console.error("Submission not found!");
      return;
    }

    const quiz = await db.collection("dve_quizzes").findOne({
      _id: new pkg.ObjectId(submission.quizId)
    });

    // Update all answers to isCorrect: true
    const updatedAnswers = (submission.answers || []).map((ans) => {
      return { ...ans, isCorrect: true };
    });

    const score = 6;
    const maxScore = 6;

    console.log("Updating dve_quiz_submissions...");
    const subResult = await db.collection("dve_quiz_submissions").updateOne(
      { _id: new pkg.ObjectId(submissionId) },
      { $set: { answers: updatedAnswers, score, maxScore, updatedAt: new Date() } }
    );
    console.log("Submission update result:", subResult);

    console.log("Updating DVE attendance record...");
    const attResult = await db.collection("dve_attendances").updateOne(
      { studentId: submission.studentId, subjectId: quiz.subjectId },
      { $set: { score, maxScore, updatedAt: new Date() } }
    );
    console.log("Attendance update result:", attResult);

    // Verify after update
    const updatedSub = await db.collection("dve_quiz_submissions").findOne({
      _id: new pkg.ObjectId(submissionId)
    });
    console.log("Updated submission score:", updatedSub.score, "/", updatedSub.maxScore);
    console.log("Updated answers:", JSON.stringify(updatedSub.answers, null, 2));

  } catch (err) {
    console.error("Error during patch execution:", err);
  } finally {
    await client.close();
  }
}

run();
