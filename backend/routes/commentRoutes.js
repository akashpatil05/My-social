// 📁 backend/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');

// 🔐 Middleware: Authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};

// 🔓 Get all comments for a specific post (Public)
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// 🔐 Create a comment (Private)
router.post('/:postId', authenticateToken, async (req, res) => {
  const { commentText } = req.body;
  const { id: userId, username } = req.user;

  if (!commentText) return res.status(400).json({ message: 'Comment text required' });

  try {
    const newComment = new Comment({
      postId: req.params.postId,
      userId,
      username,
      text: commentText,
    });

    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
