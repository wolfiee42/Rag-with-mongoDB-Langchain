import express from "express";
import dotenv from "dotenv";
dotenv.config();

// Local Modules
import myRoute from "./routes/index.js";
import mongoose from "mongoose";

// Server Initialization
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());

// Routes will be written here
app.use("/route", myRoute);

// Server Listen Along with Database
// connection(in case of data persistence)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_CONNECTION_STRING);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

app.listen(PORT, async(error) => {
  if (!error) {
    // * Database Connection
    await  connectDB();
    console.log(
      `Server is Successfully Running, and App is listening on port ${PORT}`
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
