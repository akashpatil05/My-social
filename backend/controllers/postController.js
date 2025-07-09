const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!req.user || !req.user.id || !req.user.username) {
      return res.status(401).json({ message: 'User info missing from token.' });
    }

    const newPost = new Post({
      content,
      image,
      username: req.user.username,
      author: req.user.id
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('❌ Post creation failed:', err.message);
    res.status(500).json({ message: 'Failed to create post' });
  }
};