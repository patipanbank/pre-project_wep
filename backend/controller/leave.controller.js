const { createMultipleLeave, getLeaveByUserID,getLeaveByDataId ,editLeaveStatus, getallstatusLeaveByDataId} = require("../service/leave.service");

const createLeaveController = async (req, res) => {
    try {
        const { data_id,
            semester_id,
            timeslots,
            status } = req.body;  // Expect an array of schedules in the request body
        const result = await createMultipleLeave(data_id,semester_id,timeslots,status);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};
const editLeavestatusController = async (req, res) => {
    try {
        const { data_id,
            semester_id,
            timeslots,
            status,feedback } = req.body;  // Expect an array of schedules in the request body
        // console.log(feedback);
        
        const result = await editLeaveStatus(data_id,semester_id,timeslots,status,feedback);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getInformationAppointment = async (req, res) => {
    try {
        const users_id = req.params.users_id;
        const result = await getLeaveByUserID(users_id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch appointments' });
    }
}

const getLeaveByDataIDContoller = async (req,res) => {
    try {
        const data_id = req.params.data_id;
        const status = req.params.status;
        const result = await getLeaveByDataId(data_id,status);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch appointments' });
    }
}
const getallstatusLeaveByDataIdContoller = async (req,res) => {
    try {
        const data_id = req.params.data_id;
        const status = req.params.status;
        const result = await getallstatusLeaveByDataId(data_id,status);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch appointments' });
    }
}


module.exports = {createLeaveController,getInformationAppointment,getLeaveByDataIDContoller,editLeavestatusController,getallstatusLeaveByDataIdContoller}