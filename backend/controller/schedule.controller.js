const { editMultipleSchedules } = require('../service/schedule.service');

const editScheduleController = async (req, res) => {
    try {
        const { schedules } = req.body;  // Expect an array of schedules in the request body
        const result = await editMultipleSchedules(schedules);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = { editScheduleController };
