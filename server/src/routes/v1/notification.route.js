const express = require('express');
const router = express.Router();
const controller = require('../../controllers/notification.controller');
const { verifyToken } = require('../../middlewares/auth');

router.post('/register_token',[verifyToken],controller.addRegisterToken)
router.post('/send_noti_to_user',[verifyToken],controller.sendNotificationToUser)
router.post('/send_noti_to_all_users',[verifyToken],controller.sendNotificationToAllUsers)

module.exports = router