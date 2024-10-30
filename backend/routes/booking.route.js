const express = require('express');
const router = express.Router();
const Leave = require('../model/leave');
const User = require('../model/user');
const Data = require('../model/data');
const Timeslot = require('../model/timeslot');

router.post('/api/booking', async (req, res) => {
    try {
        const {
            data_id,
            timeslots_id,
            semester_id,
            date,
            detail
        } = req.body;

        // Retrieve the user_id from cookies
        const users_id = req.cookies.user_id;

        // Validate required fields
        if (!data_id || !users_id || !timeslots_id || !semester_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // First, get the timeslot to check if it exists
        const timeslot = await Timeslot.findByPk(timeslots_id);
        if (!timeslot) {
            return res.status(404).json({
                success: false,
                message: 'Timeslot not found'
            });
        }

        // Check for existing conflicting leave records for the same timeslot
        const conflictingLeave = await Leave.findOne({
            where: {
                data_id,
                timeslots_id,
                semester_id,
                date: new Date(date),
                status: ['Available', 'Waiting', 'Leave']
            }
        });

        // Block booking if a conflict is found with an unavailable timeslot
        if (conflictingLeave && conflictingLeave.status !== 'Available' && conflictingLeave.status !== 'Empty') {
            return res.status(400).json({
                success: false,
                message: `This timeslot is not available for booking. Current status: ${conflictingLeave.status}`
            });
        }

        // Verify user exists
        const user = await User.findByPk(users_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify data_id exists
        const data = await Data.findByPk(data_id);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        const dates = new Date(date);
        // console.log(`Dates: ${date}`);
        dates.setDate(dates.getDate()+1)
        // Create a new leave record for this user
        const newLeave = await Leave.create({
            data_id,
            timeslots_id,
            semester_id,
            date: dates,
            status: 'Waiting',
            users_id,
            detail: detail || null,
            created_at: new Date(),
            updated_at: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'Booking successful',
            data: newLeave
        });

    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your booking',
            error: error.message
        });
    }
});

module.exports = router;
