import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "LostFound", required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);
