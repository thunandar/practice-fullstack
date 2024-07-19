const express = require("express");
const router = express.Router();
const controller = require("../../controllers/subscribePricing.controller");
const { verifyToken } = require("../../middlewares/auth");

// Admin

router.post("/pricing/create", [verifyToken], controller.create);


module.exports = router;
