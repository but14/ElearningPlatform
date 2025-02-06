const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    console.log("MongoDB URI:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host} `);
  } catch (error) {
    console.error("MongoDb Connection Error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
