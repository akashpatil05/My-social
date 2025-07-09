const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/:username', userController.getUserProfile);
router.put('/:username/follow', verifyToken, userController.followUser);
router.put('/:username/unfollow', verifyToken, userController.unfollowUser);

module.exports = router;