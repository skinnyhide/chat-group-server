import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 8080;
const uri = process.env.MDB_URI;

if (!uri) {
  console.log("Please provide MDB_URI");
  process.exit();
}
mongoose.connect(uri).then(() => {
  console.log("MDB Connected Successfully");

  app.listen(port, () => {
    console.log(`App listening on ${port}`);
  });
});
