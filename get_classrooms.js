const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const classroomNames = await db.collection('users').distinct('classroomName');
  const classGroupIds = await db.collection('users').distinct('classGroupId');
  console.log("ClassroomNames:", classroomNames.filter(c => c && isNaN(Number(c))));
  console.log("ClassGroupIds:", classGroupIds.filter(c => c && isNaN(Number(c))));
  process.exit(0);
});
