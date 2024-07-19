const express = require("express");
const router = express.Router();
const controller = require("../../controllers/subscription.controller");
const { verifyToken } = require("../../middlewares/auth");

// Admin

router.post("/account/update-status",[verifyToken], controller.adminUpdateAccountStatus);
router.post("/list", [verifyToken], controller.list);

// Owner
router.post("/account/create", [verifyToken], controller.subscribeAccount);
router.post("/update_account",[verifyToken], controller.updateAccountSubscription);
router.post('/account/history',[verifyToken],controller.subscribeHistory);
router.post('/account/detail',[verifyToken],controller.subscribeDetail);

module.exports = router;
