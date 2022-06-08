const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const productSchema = new mongoose.Schema(
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
    company: {
      type: String,
    },
    category: {
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
      },
    ],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

function validateProduct(data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().min(3).max(300).required(),
    info1: Joi.string().min(3).max(70).required(),
    info2: Joi.string().min(3).max(70).required(),
    info3: Joi.string().min(3).max(70).required(),
    info4: Joi.string().min(3).max(70).required(),
    company: Joi.string().min(3).max(20).required(),
    category: Joi.string().min(3).max(20).required(),
  });
  return schema.validate(data, { abortEarly: false });
}
module.exports = Product;
module.exports.validate = validateProduct;
