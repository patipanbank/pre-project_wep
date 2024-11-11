const { editMultipleSchedules,createMultipleSchedules, getSchedulebydata_id,removeMutipleSchedule,removeSelectedSchedules } = require('../service/schedule.service');

const editScheduleController = async (req, res) => {
    try {
        const { schedules } = req.body;  // Expect an array of schedules in the request body
        const result = await editMultipleSchedules(schedules);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};


const createScheduleController = async (req, res) => {
    try {
        const { data_id,
            semester_id,
            timeslots,
            status } = req.body;  // Expect an array of schedules in the request body
        const result = await createMultipleSchedules(data_id,semester_id,timeslots,status);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getSchedulebydata_idController = async (req,res) => {
    try {
        const {data_id,semester_id} = req.params;
        console.log(data_id+""+semester_id);
        const result = await getSchedulebydata_id(data_id,semester_id);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error)
    }
}
const removeScheduleController = async (req, res) => {
    try {
        const { data_id, semester_id, timeslots } = req.body;
        
        if (!data_id || !semester_id || !timeslots || !Array.isArray(timeslots)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input parameters'
            });
        }

        const results = await removeMutipleSchedule(data_id, semester_id, timeslots);
        
        res.status(200).json(results);
    } catch (error) {
        console.error('Error in removeScheduleController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

const removeSelectedSchedulesController = async (req, res) => {
    try {
        const { data_id, semester_id, timeslots } = req.body;
        
        if (!data_id || !semester_id || !timeslots || !Array.isArray(timeslots)) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่งมา'
            });
        }

        const result = await removeSelectedSchedules(data_id, semester_id, timeslots);
        res.status(200).json(result);

    } catch (error) {
        console.error('Error in removeSelectedSchedulesController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล'
        });
    }
};

module.exports = { editScheduleController,removeScheduleController,createScheduleController,getSchedulebydata_idController,removeSelectedSchedulesController };
