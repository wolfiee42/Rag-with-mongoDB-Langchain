import express from "express";
import dotenv from "dotenv";
dotenv.config();

// Local Modules
import myRoute from "./routes/index.js";

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

app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      `Server is Successfully Running, and App is listening on port ${PORT}`
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
