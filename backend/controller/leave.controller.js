const { get } = require("http");
const {
  createMultipleLeave,
  getLeaveByUserID,
  getLeaveByDataId,
  editLeaveStatus,
  getallstatusLeaveByDataId,
  deleteAllLeave,
  deleteMultipleLeave,
  getLeaveByEmail,
  getLeavestatusByUserID,
  editLeavebyuseridStatus,
  getallstatusLeaveByUserid

} = require("../service/leave.service");

const createLeaveController = async (req, res) => {
  try {
    const { data_id, semester_id, timeslots, status } = req.body; // Expect an array of schedules in the request body
    const result = await createMultipleLeave(
      data_id,
      semester_id,
      timeslots,
      status
    );
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};
const editLeavestatusController = async (req, res) => {
  try {
    const { data_id, semester_id, timeslots, status, feedback } = req.body; // Expect an array of schedules in the request body
    // console.log(feedback);

    const result = await editLeaveStatus(
      data_id,
      semester_id,
      timeslots,
      status,
      feedback
    );
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};
const editLeavestatusbyuseridController = async (req, res) => {
  try {
    const { userid, semester_id, timeslots, status, feedback } = req.body; // Expect an array of schedules in the request body
    // console.log(feedback);

    const result = await editLeavebyuseridStatus(
      userid,
      semester_id,
      timeslots,
      status,
      feedback
    );
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
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};

const deleteSelectedLeaveController = async (req, res) => {
  try {
    const { data_id, semester_id, timeslots } = req.body;

    if (!data_id || !semester_id || !timeslots || !Array.isArray(timeslots)) {
      return res.status(400).send({
        success: false,
        message: "Invalid request parameters",
      });
    }

    const result = await deleteMultipleLeave(data_id, semester_id, timeslots);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in deleteSelectedLeaveController:", err);
    res.status(500).send({
      success: false,
      error: err.message,
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
        message: "Invalid request parameters",
      });
    }

    const result = await deleteAllLeave(data_id, semester_id);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in deleteAllLeaveController:", err);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
};


const getLeaveByDataIDContoller = async (req, res) => {
  try {
    const data_id = req.params.data_id;
    const status = req.params.status;
    const result = await getLeaveByDataId(data_id, status);
    // console.log(result);
    
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};

const getLeaveByEmailContoller = async (req, res) => {
  try {
    const email = req.params.email;
    const status = req.params.status;
    const result = await getLeaveByEmail(email, status);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};
const getLeaveByUserIDstatusContoller = async (req, res) => {
  try {
    const userid = req.params.userid;
    const status = req.params.status;
    const result = await getLeavestatusByUserID(userid, status);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};

const getallstatusLeaveByDataIdContoller = async (req, res) => {
  try {
    const data_id = req.params.data_id;
    const status = req.params.status;
    const result = await getallstatusLeaveByDataId(data_id, status);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};
const getallstatusLeaveByEmailContoller = async (req, res) => {
  try {
    const email = req.params.email;
    const status = req.params.status;
    const result = await getallstatusLeaveByDataId(email, status);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};
const getallstatusLeaveByUserIdContoller = async (req, res) => {
  try {
    const userid = req.params.userid;
    const status = req.params.status;
    const result = await getallstatusLeaveByUserid(userid, status);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
};

module.exports = {
  createLeaveController,
  getInformationAppointment,
  getLeaveByDataIDContoller,
  editLeavestatusController,
  getallstatusLeaveByDataIdContoller,
  deleteSelectedLeaveController,
  deleteAllLeaveController,
  getLeaveByEmailContoller,
  getallstatusLeaveByEmailContoller,
  getLeaveByUserIDstatusContoller,
  editLeavestatusbyuseridController,
  getallstatusLeaveByUserIdContoller
};
