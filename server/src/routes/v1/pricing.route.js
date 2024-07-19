const express = require('express');
const router = express.Router();
const controller = require('../../controllers/pricing.controller');
const { verifyToken } = require('../../middlewares/auth');


// Admin

router.post('/list',[verifyToken],controller.list)
router.post('/create',[verifyToken],controller.create)
router.post('/detail',[verifyToken],controller.detail)
router.post('/update',[verifyToken],controller.update)
router.post('/delete',[verifyToken],controller.delete)

// App

router.post('/owner-pricing-list',[verifyToken],controller.ownerPricingList)


module.exports = router