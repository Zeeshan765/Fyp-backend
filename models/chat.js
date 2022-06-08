const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // message: {
    //     type: String,
    //     required: true
    // },
    user: {
      type: String,
      ref: "User",
    },
    admin: {
      type: String,
      ref: "User",

      //  ref: 'Admin',
    },
    LastUpdated: {
      type: Date,
      default: new Date(),
    },
    LastMessage: {
      type: String,
    },
    userRead: {
      type: String,
      default: "0",
    },
    adminRead: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);
var Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
