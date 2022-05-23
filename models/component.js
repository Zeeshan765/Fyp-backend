const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    price: {
      type: Number,
    },

    description: {
      type: String,
    },
    category: {
      type: String,
    },
    socket: {
      type: String,
    },
    ramSupport: {
      type: String,
    },
    size: {
      type: String,
    },
    watt: {
      type: String,
    },
    company: {
      type: String,
    },
    info1: {
      type: String,
    },
    info2: {
      type: String,
    },
    info3: {
      type: String,
    },
    info4: {
      type: String,
    },
    site: {
      type: String,
    },
    coolingsockets: {
      type: Object,
    },
    rgb: {
      type: String,
    },
    picture: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    
  }
  ],
  },
  { timestamps: true }
);

const Component =
  mongoose.models.Component || mongoose.model('Component', componentSchema);

function validateComponent(data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().min(3).max(30).required(),
    info1: Joi.string().min(3).max(25).required(),
    info2: Joi.string().min(3).max(25).required(),
    info3: Joi.string().min(3).max(25).required(),
    info4: Joi.string().min(3).max(25).required(),
    
  });
  return schema.validate(data, { abortEarly: false });
}
module.exports = Component;
module.exports.validate = validateComponent;
