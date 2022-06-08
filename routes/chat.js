const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { User } = require("../models/User");
const Chat = require("../models/Chat");
const { Message } = require("../models/Message");
const authorization = require("../middleware/authorization");
//const { Admin } = require('../models/Admin');

router.post("/user", authorization, async (req, res) => {
  let chat = await Chat.findOne({ user: req.user._id, admin: req.body.admin });
  if (!chat) {
    chat = new Chat({
      user: req.user._id,
      admin: req.body.admin,
    });
  }
  await chat.populate("admin", "name");
  return res.status(200).json(chat);
});

module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjhiNDJhNmYwMmRmZTJhMDZiMWI1YTIiLCJuYW1lIjoiTXVoYW1tYWQgWmVlc2hhbiBBc2hyYWYiLCJyb2xlIjoidXNlciIsImlhdCI6MTY1NDUwMjEwNX0.gKTEZOEgHljRnB3bZwJKtRFff4ZXT4WyQgJOXF5-7AE
