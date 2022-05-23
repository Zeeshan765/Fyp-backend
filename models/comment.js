const mongoose = require('mongoose');
const Joi = require("@hapi/joi");

const commentSchema = new mongoose.Schema(
    {
        
        comment: {
            type: String,
        },
        user:{
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            ref: 'User',
        },
        rating: {
            type: Number,
        },
    },
    { timestamps: true }
);

//export the model
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
//export the model
module.exports = Comment;
