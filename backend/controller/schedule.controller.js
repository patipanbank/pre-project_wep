const { editMultipleSchedules,createMultipleSchedules, getSchedulebydata_id,removeMutipleSchedule } = require('../service/schedule.service');

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
        const result = await removeMutipleSchedule(data_id, semester_id, timeslots);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = { editScheduleController,removeScheduleController,createScheduleController,getSchedulebydata_idController };
