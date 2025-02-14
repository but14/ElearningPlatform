const express = require("express");
const app = express();

//packages
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

//routes
const userRoutes = require("./routes/user");

// middleware
app.use(express.json());
app.use(cookieParser());

//Connection to Database
const connectDB = require("./config/database");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Connections
connectDB();

// mount route
app.use("/api/v1/auth", userRoutes);

// default Route

app.get("/", (req, res) => {
  res.send("Hello World!");
});
