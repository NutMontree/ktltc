const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const classrooms1 = await db.collection('users').distinct('classroomName');
  const classrooms2 = await db.collection('student_care_records').distinct('classroom');
  const all = [...new Set([...classrooms1, ...classrooms2])].filter(Boolean);
  console.log(all);
  process.exit(0);
});
