const mongoose = require("mongoose");
mongoose.connect("mongodb://ktltc_admin:ktltc_admin1234@127.0.0.1:27017/ktltc_db?authSource=admin")
  .then(async () => {
    const users = await mongoose.connection.db.collection("users").find({ username: "68201010004" }).toArray();
    console.log("Found:", users);
    process.exit(0);
  }).catch(console.error);
