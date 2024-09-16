// backend/routes/timeslot.routes.js
const express = require('express');
const router = express.Router();
const Timeslot = require('../model/timeslot');

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

module.exports = router;
