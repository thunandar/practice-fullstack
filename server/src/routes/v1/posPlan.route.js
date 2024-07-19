const express = require('express');
const router = express.Router();
const controller = require('../../controllers/posPlan.controller');
const { verifyToken } = require('../../middlewares/auth');

// Admin 

// router.post('/order/update-status',[verifyToken],controller.adminUpdatePlanStatus)
// router.post('/list',[verifyToken],controller.list)

// Owner
router.post('/buy_plan',[verifyToken],controller.buyPosPlan)

module.exports = router
