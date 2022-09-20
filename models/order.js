const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment'); 
const orderSchema = Schema({
  cart: {
    totalQty: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
        title: {
          type: String,
        },
        productCode: {
          type: String,
        },
      },
    ],
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  note: {
    type: String,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

autoIncrement.initialize(mongoose.connection); 

orderSchema.plugin(autoIncrement.plugin, 'Order'); 

module.exports = mongoose.model("Order", orderSchema);

