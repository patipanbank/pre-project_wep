const express = require('express');
const router = express.Router();
const Leave = require('../model/leave');
const User = require('../model/user');
const Data = require('../model/data');
const Timeslot = require('../model/timeslot');
const {getLeaveByDataIDContoller,editLeavestatusController,getallstatusLeaveByDataIdContoller} = require('../controller/leave.controller');
// ในส่วนของ Backend - แก้ไข route การจอง
router.post('/api/booking', async (req, res) => {
    try {
        const {
            data_id,
            timeslots_id,
            semester_id,
            date,
            detail
        
        } = req.body;

        const users_id = req.cookies.user_id;

        if (!data_id || !users_id || !timeslots_id || !semester_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // แก้ไขการสร้างวันที่โดยใช้ timezone ของประเทศไทย (UTC+7)
        const bookingDate = new Date(date);
        bookingDate.setUTCHours(17, 0, 0, 0); // ตั้งเวลาเป็น 00:00 ตามเวลาประเทศไทย (17:00 UTC ของวันก่อนหน้า)

        // ... โค้ดส่วนที่เหลือเหมือนเดิม ...

        const newLeave = await Leave.create({
            data_id,
            timeslots_id,
            semester_id,
            date: bookingDate,
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

router.put('/booking/changestatus',editLeavestatusController);

router.get('/booking/:data_id/:status', getLeaveByDataIDContoller)
router.get('/booking/status/:data_id/:status', getallstatusLeaveByDataIdContoller)

module.exports = router;
