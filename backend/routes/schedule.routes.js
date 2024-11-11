
const express = require('express');
const router = express.Router();
const { removeScheduleController,createScheduleController,getSchedulebydata_idController,editScheduleController,removeSelectedSchedulesController } = require('../controller/schedule.controller');

router.post('/createSchedule',createScheduleController);
router.get('/getSchedulebydataId/:data_id/:semester_id',getSchedulebydata_idController)
router.put('/editSchedule',editScheduleController);
router.delete('/removeSchedule', removeScheduleController);
router.delete('/removeSelectedSchedules', removeSelectedSchedulesController);

module.exports = router;
