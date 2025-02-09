const express = require("express");
const app = express();


//packages 
const cors = require("cors");
require("dotenv").config();


//Connection to Database
const connectDB = require("./config/database");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Connections
connectDB();
