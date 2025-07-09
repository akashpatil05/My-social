const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// ✅ Make sure verifyToken is imported properly
const verifyToken = require('../middleware/auth');

// 🟦 GET comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    return res.json(post.comments || []);
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching comments' });
  }
});

// 🟩 POST a new comment
router.post('/:postId', verifyToken, async (req, res) => {
  const { commentText } = req.body;
  if (!commentText.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      username: req.user.username,
      text: commentText,
    };
    post.comments.push(comment);
    await post.save();
    return res.status(201).json(comment);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;