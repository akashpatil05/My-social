const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfileByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).populate('followers following', 'username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ username }).sort({ createdAt: -1 });

    res.json({
      user: {
        username: user.username,
        profilePicture: user.profilePicture,
        followers: user.followers.length,
        following: user.following.length,
        id: user._id,
      },
      posts,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleFollow = async (req, res) => {
  const { targetUsername } = req.params;
  const { username: currentUsername } = req.user;

  try {
    const targetUser = await User.findOne({ username: targetUsername });
    const currentUser = await User.findOne({ username: currentUsername });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'Unfollowed' : 'Followed',
      followers: targetUser.followers.length,
      following: currentUser.following.length,
    });
  } catch (err) {
    console.error('Follow/Unfollow Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
