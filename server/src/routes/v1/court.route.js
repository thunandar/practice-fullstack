const express = require("express");
const router = express.Router();
const controller = require("../../controllers/court.controller");
const { verifyToken } = require("../../middlewares/auth");

// app
router.post("/list", [verifyToken], controller.list);
router.post("/create", [verifyToken], controller.create);
router.post("/detail", [verifyToken], controller.detail);
router.post("/update", [verifyToken], controller.update);
router.post("/delete", [verifyToken], controller.delete);
router.post("/history", [verifyToken], controller.history);

// admin
router.post("/admin/list", [verifyToken], controller.adminCourtList);

// employee
router.post("/employee/list", [verifyToken], controller.employeeCourtList);

// user app
router.post("/user-township", [verifyToken], controller.courtByUserTownship);
router.post("/search", [verifyToken], controller.searchCourt);
router.post("/popular_list", [verifyToken], controller.popularCourtsList);

module.exports = router;
