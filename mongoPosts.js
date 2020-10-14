const mongoose = require("mongoose");
const postModel = mongoose.Schema({
  user: String,
  imgName: String,
  text: String,
  avatar: String,
  timestamp: String,
});

module.exports = Post = mongoose.model("posts", postModel);
