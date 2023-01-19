import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new mongoose.Schema({
  text: { type: String },
  sender: { type: ObjectId, ref: "user", required: true },
  chat: { type: ObjectId, refPath: "chatType", required: true },
  chatType: { type: String, enum: ["user", "channel"], required: true },
  date: { type: Number, required: true },
});
const Message = mongoose.model("message", messageSchema);

export default Message;
