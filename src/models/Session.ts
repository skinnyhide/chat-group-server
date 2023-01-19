import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

const sessionSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: "user", required: true },
  token: { type: String, required: true },
  ip: { type: String, required: true },
  cityName: { type: String, required: true },
  countryName: { type: String, required: true },
  timezone: { type: String, required: true },
});
const Session = mongoose.model("session", sessionSchema);

export default Session;
