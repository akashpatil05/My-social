// 📁 backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// 🔐 Middleware: Authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Access Denied: No Token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 JWT Decoded:", decoded); // Debug line
    req.user = decoded; // Attach user info
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};

// 🔓 GET All Posts (Public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// 🔐 Create a New Post (Private)
router.post('/', authenticateToken, async (req, res) => {
  const { content, image } = req.body;

  console.log("📥 Incoming post request:", { content, image });
  console.log("🔐 From user:", req.user);

  if (!content && !image) {
    return res.status(400).json({ message: 'Post must contain content or an image' });
  }

  try {
    const newPost = new Post({
      username: req.user.username,
      author: req.user.id,
      content,
      image,
    });

    const savedPost = await newPost.save();
    console.log("✅ Post saved:", savedPost);
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("❌ Post creation error:", err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// 🔐 Delete a Post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.username !== req.user.username) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;