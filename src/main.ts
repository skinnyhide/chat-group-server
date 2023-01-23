import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import routes from "./routes/index.js";

const app = express();
const env = process.env;
const port = env.PORT || 8080;
const uri = env.MDB_URI;

if (!uri) {
  throw Error("Please provide MDB_URI");
}
if (!env.PASSWORD_SALT) {
  throw Error("Please provide PASSWORD_SALT");
}
if (!env.LOCATION_API_KEY) {
  throw Error("Please provide LOCATION_API_KEY");
}
app.use(express.json());
app.use(routes);

mongoose.connect(uri).then(() => {
  console.log("MDB Connected Successfully");

  app.listen(port, () => {
    console.log(`App listening on ${port}`);
  });
});
