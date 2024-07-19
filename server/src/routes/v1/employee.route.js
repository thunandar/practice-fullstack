const express = require('express');
const router = express.Router();
const controller = require('../../controllers/employee.controller');
const { verifyToken } = require('../../middlewares/auth');

router.post('/dashboard',[verifyToken],controller.dashboard)
router.post('/list',[verifyToken],controller.list)
router.post('/create',[verifyToken],controller.create)
router.post('/detail',[verifyToken],controller.detail)
router.post('/update',[verifyToken],controller.update)
router.post('/delete',[verifyToken],controller.delete)

module.exports = router