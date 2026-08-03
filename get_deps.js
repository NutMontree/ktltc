const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const deps = await db.collection('studentcares').distinct('department');
  console.log(deps);
  process.exit(0);
});
