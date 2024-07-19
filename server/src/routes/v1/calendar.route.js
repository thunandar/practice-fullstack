const express = require('express');
const router = express.Router();
const controller = require('../../controllers/calendar.controller');
const { verifyToken } = require('../../middlewares/auth');

router.post('/list',[verifyToken],controller.list)
router.post('/update',[verifyToken],controller.updateOffTime)

module.exports = router