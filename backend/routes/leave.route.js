const express = require('express');
const { createLeaveController } = require("../controller/leave.controller");
const router = express.Router();

router.post('/createLeave',createLeaveController);
module.exports = router