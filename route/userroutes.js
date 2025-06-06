const express = require('express');
const router = express.Router();

const {
  getUserNotifications,
  markNotificationAsRead
} = require('../controllers/userController');

router.get('/:userId/notifications', getUserNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);

module.exports = router;