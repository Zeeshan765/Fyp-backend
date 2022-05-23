const { object } = require('@hapi/joi');
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    user: { type: String, ref: 'User', required: true },

    orderItems: [
      {
        _id: { type: String },
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
        quantity: {
          type: Number,
        },

        type: {
          type: String,
        },
      },
    ],
    address: { type: Object },
    city: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    type: { type: String },

    status: { type: String, default: 'Pending' },
    amount: { type: Number, required: true },
    paidAt: {
      type: Date,
      required: true,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
