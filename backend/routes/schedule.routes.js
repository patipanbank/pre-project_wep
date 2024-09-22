
const express = require('express');
const router = express.Router();
const Schedule = require('../model/schedule');
const Timeslot = require('../model/timeslot');
const Semester = require('../model/semester');
const Data = require('../model/data');  
const { removeScheduleController,createScheduleController,getSchedulebydata_idController,editScheduleController } = require('../controller/schedule.controller');


// Helper function to add days
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to generate weekly schedule
async function generateWeeklySchedule(timeslots, semester, data_id, status) {
  const schedules = [];

  const startDate = new Date(semester.start_date);
  const endDate = new Date(semester.end_date);
  const weekInMillis = 7 * 24 * 60 * 60 * 1000;

  for (let date = startDate; date <= endDate; date = addDays(date, 7)) {
    for (const timeslot of timeslots) {
      schedules.push({
        date: date.toISOString().split('T')[0],
        timeslots_id: timeslot,
        data_id: data_id,
        semester_id: semester.semester_id,
        status: status,
      });
    }
  }

  return Schedule.bulkCreate(schedules, { updateOnDuplicate: ['status', 'date'] });
}

// router.post('/generate-schedules', async (req, res) => {
//   const { data_id, semester_id, timeslots, status } = req.body;

//   try {
//     // Fetch semester to get start and end dates
//     const semester = await Semester.findByPk(semester_id);
//     if (!semester) {
//       return res.status(404).json({ message: 'Semester not found' });
//     }

//     const startDate = new Date(semester.start_date);
//     const endDate = new Date(semester.end_date);
//     const weekInMillis = 7 * 24 * 60 * 60 * 1000;

//     // Iterate through each week between start and end date
//     for (let currentDate = startDate; currentDate <= endDate; currentDate = new Date(currentDate.getTime() + weekInMillis)) {
//       // Iterate through each selected timeslot
//       for (const timeslot_id of timeslots) {
//         // Check if a schedule already exists with the same date and timeslot_id
//         const existingSchedule = await Schedule.findOne({
//           where: {
//             date: currentDate,
//             timeslots_id: timeslot_id,
//             data_id: data_id
//           }
//         });

//         if (existingSchedule) {
//           // If exists, update the status
//           existingSchedule.status = status;
//           await existingSchedule.save();
//         } else {
//           // If not exists, create a new schedule entry
//           await Schedule.create({
//             date: currentDate,
//             timeslots_id: timeslot_id,
//             data_id: data_id,
//             semester_id: semester_id,
//             status: status
//           });
//         }
//       }
//     }

//     res.status(200).json({ message: 'Schedules generated or updated successfully!' });
//   } catch (error) {
//     console.error('Error generating or updating schedules:', error);
//     res.status(500).json({ message: 'Error generating or updating schedules: ' + error.message });
//   }
// });

router.post('/createSchedule',createScheduleController);
router.get('/getSchedulebydataId/:data_id/:semester_id',getSchedulebydata_idController)
router.put('/editSchedule',editScheduleController);
router.delete('/removeSchedule', removeScheduleController);
module.exports = router;
