const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = Schema({
  imagePath: {
    type: String,
    required: true,
    get: convertImagePath,
  }
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
module.exports = mongoose.model("Banner", bannerSchema);
