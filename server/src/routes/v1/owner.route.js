const express = require('express');
const router = express.Router();
const controller = require('../../controllers/owner.controller');
const { verifyToken } = require('../../middlewares/auth');

// Admin 

router.post('/status/update',[verifyToken],controller.adminUpdateOwnerStatus)
router.post('/list',[verifyToken],controller.list)
router.post('/detail',[verifyToken],controller.detail) 
router.post('/update',[verifyToken],controller.update)
router.post('/delete',[verifyToken],controller.delete)

// Owner
router.post('/update_profile',[verifyToken],controller.updateOwnerProfile)
router.post('/update_password',[verifyToken],controller.updateOwnerPassword)
router.post('/dashboard',[verifyToken],controller.dashboard)


module.exports = router
