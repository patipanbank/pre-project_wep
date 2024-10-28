// backend/routes/timeslot.routes.js
const express = require('express');
const router = express.Router();
const Timeslot = require('../model/timeslot');
const {getSlotbydata_idController,leaveSlotController,leavescheduleSlotController} = require('../controller/slot.controller')
// Get all timeslots
router.get('/timeslots', async (req, res) => {
  try {
    const timeslots = await Timeslot.findAll({
      attributes: ['timeslots_id', 'start_time', 'end_time', 'dayofweek']  // ระบุคอลัมน์ที่ต้องการ
    });
    res.status(200).json(timeslots);
  } catch (error) {
    console.error('Error fetching timeslots:', error);
    res.status(500).json({ message: 'Error fetching timeslots: ' + error.message });
  }
});

router.get('/timesclotsbydataid/:data_id/:semester_id',getSlotbydata_idController)
router.get('/timesclotsbyleave/:data_id/:semester_id/:start_date/:end_date',leaveSlotController)
router.get('/timesclotsbyleaveschedule/:data_id/:semester_id/:start_date/:end_date',leavescheduleSlotController)

module.exports = router;
