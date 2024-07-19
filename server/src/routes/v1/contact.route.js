const express = require("express");
const router = express.Router();
const controller = require("../../controllers/contact.controller");
const { verifyToken } = require("../../middlewares/auth");

// Admin
router.post("/list", [verifyToken], controller.list);
router.post("/delete", [verifyToken], controller.delete);

//App
router.post("/send", [verifyToken], controller.send);

module.exports = router;
