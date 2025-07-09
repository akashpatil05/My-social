// 📁 backend/models/Post.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: String,
  text: String,
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  username: String,
  content: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ Required
  comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);