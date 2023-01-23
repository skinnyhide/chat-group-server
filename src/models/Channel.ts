import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  description: { type: String },
  creator: { type: ObjectId, ref: "user", required: true },
  type: { type: String, enum: ["private", "public"], required: true },
  pictureUrl: { type: String },
  thumbnailUrl: { type: String },
  totalMembers: { type: Number, required: true },
  admins: [{ type: ObjectId, ref: "user", required: true }],
  moderators: [{ type: ObjectId, ref: "user" }],
  inviteLinks: [{ type: String }],
});
const Channel = mongoose.model("channel", channelSchema);

export default Channel;
