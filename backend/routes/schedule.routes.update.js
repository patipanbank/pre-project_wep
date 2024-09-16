const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Data = require('../models/data');
const Timeslot = require('../models/timeslot');
const Semester = require('../models/semester');

// Update office hours or leave status
router.post('/update-schedule', async (req, res) => {
  const { semester_id, updates, status } = req.body; // updates should be an array of objects with date, time, and day

  try {
    if (!semester_id || !status || !updates || !['Available', 'Leave'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request data.' });
    }

    // Find the semester
    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found.' });
    }

    // Find or create schedules for the semester and updates
    for (const update of updates) {
      const { date, time, day } = update;
      // Find or create a schedule for the given date, time, and day
      await Schedule.upsert({
        date,
        timeslots_id: time, // Assuming `time` corresponds to `timeslots_id`
        semester_id: semester_id,
        status
      });
    }

    res.status(200).json({ message: 'Schedules updated successfully.' });
  } catch (error) {
    console.error('Error updating schedules:', error);
    res.status(500).json({ message: 'Error updating schedules: ' + error.message });
  }
});

module.exports = router;
