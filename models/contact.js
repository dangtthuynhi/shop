const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = Schema({
  name: {
    type: String,
  },
  phone:{
    type: String,
  },
  email: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Contact", contactSchema);
