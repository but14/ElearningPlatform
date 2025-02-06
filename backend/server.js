const express = require("express");
const app = express();
require("dotenv").config();

const connectDB = require("./config/database");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Connections
connectDB();
