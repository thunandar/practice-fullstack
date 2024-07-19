const express = require("express");
const router = express.Router();
const controller = require("../../controllers/auth.controller");
const { verifyToken } = require("../../middlewares/auth");

//  User Routes
router.post("/user_register", controller.userRegister);
router.post("/user_login", controller.userLogin);
router.post("/auth_user", verifyToken, controller.authUser);

// Owner Routes
router.post("/owner_register", controller.ownerRegister);
router.post("/owner_login", controller.ownerLogin);
router.post("/auth_owner", [verifyToken], controller.authOwner);
router.post("/owner_email_verify_code", controller.ownerEmailVerifyCode);

// reset password
router.post("/reset_password", controller.resetPassword);
router.post("/verify_code", controller.verifyCode);
router.post("/update_password", controller.updatePassword);

// employee
router.post("/employee_login", controller.employeeLogin);

// Admin Routes

router.post("/admin_login", controller.adminLogin);

module.exports = router;
