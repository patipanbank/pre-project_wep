const { createMultipleLeave, getLeaveByUserID,deleteAllLeave,deleteMultipleLeave } = require("../service/leave.service");

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

const getInformationAppointment = async (req, res) => {
    try {
        const users_id = req.params.users_id;
        const result = await getLeaveByUserID(users_id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch appointments' });
    }
}

const deleteSelectedLeaveController = async (req, res) => {
    try {
        const { data_id, semester_id, timeslots } = req.body;
        
        if (!data_id || !semester_id || !timeslots || !Array.isArray(timeslots)) {
            return res.status(400).send({ 
                success: false, 
                message: 'Invalid request parameters' 
            });
        }

        const result = await deleteMultipleLeave(data_id, semester_id, timeslots);
        res.status(200).send(result);
    } catch (err) {
        console.error('Error in deleteSelectedLeaveController:', err);
        res.status(500).send({ 
            success: false, 
            error: err.message 
        });
    }
};

// New controller for deleting all leaves
const deleteAllLeaveController = async (req, res) => {
    try {
        const { data_id, semester_id } = req.body;
        
        if (!data_id || !semester_id) {
            return res.status(400).send({ 
                success: false, 
                message: 'Invalid request parameters' 
            });
        }

        const result = await deleteAllLeave(data_id, semester_id);
        res.status(200).send(result);
    } catch (err) {
        console.error('Error in deleteAllLeaveController:', err);
        res.status(500).send({ 
            success: false, 
            error: err.message 
        });
    }
};


module.exports = {createLeaveController,getInformationAppointment,deleteAllLeaveController,deleteSelectedLeaveController}