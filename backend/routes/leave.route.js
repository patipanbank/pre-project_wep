const express = require('express');
const { createLeaveController, getInformationAppointment,deleteAllLeaveController,deleteSelectedLeaveController } = require("../controller/leave.controller");
const router = express.Router();

router.post('/createLeave',createLeaveController);

router.get('/informationAppointment/:users_id', getInformationAppointment);

router.delete('/deleteSelected', deleteSelectedLeaveController);
router.delete('/deleteAll', deleteAllLeaveController);


module.exports = router