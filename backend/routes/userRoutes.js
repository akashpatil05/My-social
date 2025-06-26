const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const verifyToken = require('../middleware/auth');

// ✅ Get user profile with follow info
router.get('/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ username }).sort({ createdAt: -1 });

    const isFollowing = user.followers.some(
      (id) => id.toString() === currentUserId
    );

    res.status(200).json({
      user: {
        ...user,
        isFollowing,
        followers: user.followers,
        following: user.following
      },
      posts
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Follow a user
router.post('/:username/follow', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findOne({ username });
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: 'User not found' });

    if (targetUser._id.equals(currentUserId))
      return res.status(400).json({ message: "You can't follow yourself" });

    if (targetUser.followers.includes(currentUserId))
      return res.status(400).json({ message: 'Already following' });

    targetUser.followers.push(currentUserId);
    currentUser.following.push(targetUser._id);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Unfollow a user
router.post('/:username/unfollow', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findOne({ username });
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: 'User not found' });

    if (!targetUser.followers.includes(currentUserId))
      return res.status(400).json({ message: 'Not following this user' });

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
