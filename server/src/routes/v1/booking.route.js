const express = require("express");
const router = express.Router();
const controller = require("../../controllers/booking.controller");
const { verifyToken } = require("../../middlewares/auth");

router.post("/check_time", [verifyToken], controller.checkBookingTime);
router.post("/", [verifyToken], controller.book);
router.post("/detail", [verifyToken], controller.detail);
router.post("/owner/list", [verifyToken], controller.ownerBookingList);
router.post("/employee/list", [verifyToken], controller.employeeBookingList);
router.post("/user/list", [verifyToken], controller.userBookingList);

router.post("/time/list", [verifyToken], controller.getTimeListByDate);
router.post("/change/status", [verifyToken], controller.changeBookingStatus);

// admin
router.post("/admin/list", [verifyToken], controller.list);

// search
router.post("/search", [verifyToken], controller.search);

module.exports = router;
