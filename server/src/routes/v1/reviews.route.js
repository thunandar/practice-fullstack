const express = require("express");
const router = express.Router();
const controller = require("../../controllers/reviews.controller");
const { verifyToken } = require("../../middlewares/auth");

router.post("/",[verifyToken], controller.review);
router.post("/list", [verifyToken], controller.reviewByCourt);
router.post("/update", [verifyToken], controller.updateReview);
router.post("/delete", [verifyToken], controller.deleteReview);

// Owner
router.post("/report", [verifyToken], controller.reportReviewsByOwner);

// Admin
router.post(
  "/admin/list",
  [verifyToken],
  controller.reportedReviewsListByAdmin
);
router.post(
  "/admin/reported/delete",
  [verifyToken],
  controller.deleteReportedReviewsByAdmin
);

module.exports = router;
