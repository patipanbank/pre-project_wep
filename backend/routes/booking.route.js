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

        // Check for existing leave record with status
        const existingLeave = await Leave.findOne({
            where: {
                data_id,
                timeslots_id,
                semester_id,
                date: new Date(date)
            }
        });

        // If no leave record exists, create a new one
        if (!existingLeave) {
            const newLeave = await Leave.create({
                data_id,
                timeslots_id,
                semester_id,
                date: new Date(date),
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
        }

        // Check if the existing leave record is available for booking
        if (existingLeave.status !== 'Available' && existingLeave.status !== 'Empty') {
            return res.status(400).json({
                success: false,
                message: `This timeslot is not available for booking. Current status: ${existingLeave.status}`
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

        // Update the existing leave record
        const updatedLeave = await existingLeave.update({
            status: 'Waiting',
            users_id: users_id,
            detail: detail || null,
            updated_at: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'Booking successful',
            data: updatedLeave
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
