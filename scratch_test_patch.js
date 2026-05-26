import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";

// Plain JavaScript gradeQuiz
function gradeQuiz(questions, answers) {
  let totalScore = 0;
  let totalMaxScore = 0;

  for (const q of questions) {
    const points = Number(q.points) || 0;
    totalMaxScore += points;

    const studentAnsObj = answers.find((a) => a.questionId === q.id);
    if (!studentAnsObj) continue;

    const studentAns = studentAnsObj.answer;

    if (q.type === "short_answer") {
      const teacherCorrect = studentAnsObj.isCorrect;
      const isCorrect = (teacherCorrect !== undefined) ? teacherCorrect : true;
      if (isCorrect) {
        totalScore += points;
      }
      studentAnsObj.isCorrect = isCorrect;
      continue;
    }

    const correctAns = q.correctAnswer;
    if (!correctAns) continue;

    if (q.type === "multiple_choice") {
      const sVal = String(studentAns || "").trim().toLowerCase();
      const cVal = String(correctAns || "").trim().toLowerCase();
      if (sVal === cVal && sVal !== "") {
        totalScore += points;
      }
    } else if (q.type === "checkboxes") {
      const sArr = Array.isArray(studentAns) ? studentAns.map(v => String(v || "").trim().toLowerCase()).sort() : [];
      const cArr = Array.isArray(correctAns) ? correctAns.map(v => String(v || "").trim().toLowerCase()).sort() : [String(correctAns || "").trim().toLowerCase()];
      
      if (sArr.length === cArr.length && sArr.every((v, i) => v === cArr[i]) && sArr.length > 0) {
        totalScore += points;
      }
    }
  }

  return { score: totalScore, maxScore: totalMaxScore };
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    const submissionId = "6a1523b59c14b485a467aacc";
    const questionId = "1779768178272";
    const isCorrect = true; // Let's set it to true!

    console.log("--- BEFORE PATCH ---");
    const submission = await db.collection("dve_quiz_submissions").findOne({
      _id: new pkg.ObjectId(submissionId)
    });
    console.log("Answers:", JSON.stringify(submission.answers, null, 2));
    console.log("Score:", submission.score, "/", submission.maxScore);

    const quiz = await db.collection("dve_quizzes").findOne({
      _id: new pkg.ObjectId(submission.quizId)
    });

    console.log("--- RUNNING PATCH LOGIC ---");
    const updatedAnswers = (submission.answers || []).map((ans) => {
      if (ans.questionId === questionId) {
        return { ...ans, isCorrect };
      }
      return ans;
    });

    const { score, maxScore } = gradeQuiz(quiz.questions || [], updatedAnswers);
    console.log("Recalculated Score:", score, "/", maxScore);
    console.log("Updated Answers:", JSON.stringify(updatedAnswers, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
