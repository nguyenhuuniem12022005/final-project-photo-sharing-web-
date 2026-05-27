const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  const uri = process.env.MONGODB_URI || process.env.DB_URL;
  if (typeof uri !== "string" || uri.trim() === "") {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(
      new Error(
        "Missing MongoDB connection string. Set MONGODB_URI (preferred) or DB_URL in backend/.env"
      )
    );
    return;
  }
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;
