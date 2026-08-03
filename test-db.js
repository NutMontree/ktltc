const mongoose = require('mongoose');
const uri = "mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin";
mongoose.connect(uri)
  .then(() => {
    console.log("Database connection successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
