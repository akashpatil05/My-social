// 📁 backend/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post');

// ✅ Get user profile with followers, following, and posts
const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username })
      .populate('followers', 'username')
      .populate('following', 'username');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ✅ Also populate the author field in posts so frontend gets correct info
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username profilePicture') // Optional enhancement
      .sort({ createdAt: -1 });

    return res.status(200).json({
      username: user.username,
      followers: user.followers.map(u => u.username),
      following: user.following.map(u => u.username),
      posts: posts.map(post => ({
        _id: post._id,
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
      })),
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ✅ Follow a user
const followUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUsername = req.params.username;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findOne({ username: targetUsername });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ error: "You can't follow yourself." });
    }

    if (!targetUser.followers.includes(currentUser._id)) {
      targetUser.followers.push(currentUser._id);
      currentUser.following.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();
    }

    return res.status(200).json({ message: 'Followed successfully.' });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ✅ Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUsername = req.params.username;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findOne({ username: targetUsername });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    targetUser.followers = targetUser.followers.filter(
      (followerId) => !followerId.equals(currentUser._id)
    );

    currentUser.following = currentUser.following.filter(
      (followingId) => !followingId.equals(targetUser._id)
    );

    await targetUser.save();
    await currentUser.save();

    return res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (err) {
    console.error("Unfollow error:", err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ✅ Export all functions
module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
};