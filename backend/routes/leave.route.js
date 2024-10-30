const express = require('express');
const { createLeaveController, getInformationAppointment } = require("../controller/leave.controller");
const router = express.Router();

router.post('/createLeave',createLeaveController);

router.get('/informationAppointment/:users_id', getInformationAppointment);


module.exports = router