const express = require('express');
const router = express.Router();
const controller = require('../../controllers/user.controller');
const { verifyToken } = require('../../middlewares/auth');

router.post('/register_default_details',[verifyToken],controller.registerDefaultUserDetails)

router.post('/list',[verifyToken],controller.list)
router.post('/search',[verifyToken],controller.search)
router.post("/update", [verifyToken], controller.userUpdate);

module.exports = router