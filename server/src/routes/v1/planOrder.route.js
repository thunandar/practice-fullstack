const express = require('express');
const router = express.Router();
const controller = require('../../controllers/planOrder.controller');
const { verifyToken } = require('../../middlewares/auth');

// Admin 

router.post('/order/update-status',[verifyToken],controller.adminUpdatePlanStatus)
router.post('/list',[verifyToken],controller.list)

// Owner
router.post('/order',[verifyToken],controller.planOrder)
router.post('/update_order',[verifyToken],controller.updatePlanOrder)
router.post('/order/history',[verifyToken],controller.planHistory)

router.post('/order/detail',[verifyToken],controller.planDetail)

module.exports = router
