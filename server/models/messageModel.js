import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    text: {
      type: String,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel
