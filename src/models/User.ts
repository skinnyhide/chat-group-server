import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pictureUrl: { type: String },
  thumbnailUrl: { type: String },
  channels: [{ type: ObjectId, ref: "channel" }],
});
const User = mongoose.model("user", userSchema);

export default User;
