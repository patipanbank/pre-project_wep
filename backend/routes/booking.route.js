const express = require("express");
const router = express.Router();
const Leave = require("../model/leave");
const User = require("../model/user");
const Data = require("../model/data");
const Timeslot = require("../model/timeslot");
const {
  getLeaveByDataIDContoller,
  editLeavestatusController,
  getallstatusLeaveByDataIdContoller,
  getLeaveByEmailContoller,
  getallstatusLeaveByEmailContoller,
  getLeaveByUserIDstatusContoller,
  editLeavestatusbyuseridController,
  getallstatusLeaveByUserIdContoller
} = require("../controller/leave.controller");
// ในส่วนของ Backend - แก้ไข route การจอง
router.post("/api/booking", async (req, res) => {
  try {
    const { data_id, timeslots_id, semester_id, date, detail } = req.body;
    const users_id = req.cookies.user_id;

    if (!data_id || !users_id || !timeslots_id || !semester_id || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // สร้างวันที่โดยไม่ปรับ timezone
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const timeslot = await Timeslot.findByPk(timeslots_id);
    if (!timeslot) {
      return res.status(404).json({
        success: false,
        message: "Timeslot not found",
      });
    }

    const conflictingLeave = await Leave.findOne({
      where: {
        data_id,
        timeslots_id,
        semester_id,
        date: bookingDate,
      },
    });

    // อนุญาตให้จองได้เฉพาะเมื่อสถานะเป็น Available หรือ Reject
    if (conflictingLeave && 
        conflictingLeave.status !== "Available" && 
        conflictingLeave.status !== "Reject") {
      return res.status(400).json({
        success: false,
        message: `This timeslot is not available for booking. Current status: ${conflictingLeave.status}`,
      });
    }

    const user = await User.findByPk(users_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const data = await Data.findByPk(data_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    let newLeave;
    if (conflictingLeave) {
      // อัพเดทสถานะจาก Available หรือ Reject เป็น Waiting
      newLeave = await conflictingLeave.update({
        status: "Waiting",
        users_id,
        detail: detail || null,
        updated_at: new Date(),
      });
    } else {
      // สร้างการจองใหม่
      newLeave = await Leave.create({
        data_id,
        timeslots_id,
        semester_id,
        date: bookingDate,
        status: "Waiting",
        users_id,
        detail: detail || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking successful",
      data: newLeave,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your booking",
      error: error.message,
    });
  }
});

router.put("/booking/changestatus", editLeavestatusController);
router.put("/booking/changestatus/userid", editLeavestatusbyuseridController);

router.get("/booking/:data_id/:status", getLeaveByDataIDContoller);
router.get("/booking/email/:email/:status", getLeaveByEmailContoller);
router.get("/booking/userid/:userid/:status", getLeaveByUserIDstatusContoller);
router.get(
  "/booking/status/:data_id/:status",
  getallstatusLeaveByDataIdContoller
);
router.get(
  "/booking/status/email/:email/:status",
  getallstatusLeaveByEmailContoller
);
router.get(
  "/booking/status/userid/:userid/:status",
  getallstatusLeaveByUserIdContoller
);

module.exports = router;
