const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      ref: "User",
    },
    chat: {
      type: String,
      ref: "Chat",
    },
    contenttype: {
      type: String,
     
    },
    content: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);
var Message = mongoose.model("Message", messageSchema);
module.exports = Message;
