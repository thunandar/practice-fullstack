const express = require('express');
const router = express.Router();
const controller = require('../../controllers/nrc.controller');

router.post('/region/list',controller.regionList)

module.exports = router
