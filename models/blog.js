const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const date = require('date-and-time');
const now  =  new Date();
const blogSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  quickDescription:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    default: date.format(now,'DD/MM/YYYY HH:mm:ss'),
  },
  slug: {
    type: String,
    unique: true,
    slug: "title",
  },
});

module.exports = mongoose.model("Blog", blogSchema);
