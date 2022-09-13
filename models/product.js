const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
    get: convertImagePath,
  },
  sizes: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  available: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
function convertImagePath(imagePath) {
  // Array of allowed files
  const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif'];

  var result = imagePath;
  // Get the extension of the uploaded file
  const file_extension = imagePath.slice(
    ((imagePath.lastIndexOf('.') - 1) >>> 0) + 2
  );

  // Check if the uploaded file is allowed
  if (!array_of_allowed_files.includes(file_extension)) {
    result = imagePath.replace(/\/file\/d\/(.+)\/(.+)/, "/uc?export=view&id=$1")
  }
  return result;
}

module.exports = mongoose.model("Product", productSchema);
