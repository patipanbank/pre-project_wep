const { start } = require("repl");
const Leave = require("../model/leave");
const Slot = require("../model/timeslot");
const Datas = require("../model/data");
const User = require("../model/user");

const createMultipleLeave = async (data_id, semester_id, timeslots, status) => {
  try {
    // Use map to return promises inside Promise.all
    const results = await Promise.all(
      timeslots.map(async ({ timeslots_id, dates }) => {
        console.log(`date: ${dates}`);

        const date = new Date(dates);
        date.setHours(0, 0, 0, 0);

        const findSchedule = await Leave.findOne({
          where: {
            data_id: data_id,
            timeslots_id: timeslots_id,
            semester_id: semester_id,
          },
        });

        if (findSchedule && findSchedule.status === status) {
          return { message: `Schedule is ${status} already` }; // Exit the current iteration of the loop
        }

        if (findSchedule && findSchedule.status !== status) {
          findSchedule.status = status;
          await findSchedule.save();
          return {
            message: `Schedule with data_id: ${data_id} updated successfully`,
          };
        }

        const res = await Leave.create({
          status: status,
          timeslots_id: timeslots_id,
          data_id: data_id,
          semester_id: semester_id,
          date: date,
        });
        console.log(`Date ${res.date}`);

        return res
          ? {
              message: `Schedule with data_id: ${data_id} created successfully`,
            }
          : null;
      })
    );

    results.forEach((result) => console.log(`Input: ${result.message}`));
    return results.filter(Boolean); // Return only successful results
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getLeaveByUserID = async (users_id) => {
  try {
    console.log("Fetching appointments for user:", users_id);

    const appointment = await Leave.findAll({
      where: {
        users_id: users_id,
      },
      order: [["date", "DESC"]], // Sort by date descending
    });

    console.log(`Found ${appointment.length} appointments`);

    const result = await Promise.all(
      appointment.map(async (appointment) => {
        const slot = await Slot.findByPk(appointment.timeslots_id);
        const teacher = await Datas.findByPk(appointment.data_id);
        const user = await User.findByPk(users_id);

        if (!slot || !teacher || !user) {
          console.log("Missing related data:", {
            slot: !!slot,
            teacher: !!teacher,
            user: !!user,
          });
          return null;
        }

        const appointmentDate = new Date(appointment.date);
        const day = appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        return {
          users_id: appointment.users_id,
          timeslots_id: slot.timeslots_id,
          date: appointmentDate,
          day: day,
          time: `${slot.start_time} - ${slot.end_time}`,
          status: appointment.status,
          detail: appointment.detail,
          feedback: appointment.feedback,
          teacher_id: teacher.data_id,
          teacher_name: teacher.name,
          teacher_email: teacher.email,
          username: user.name,
          useremail: user.email,
        };
      })
    );

    // Filter out any null results from missing data
    const filteredResult = result.filter((item) => item !== null);
    console.log(`Returning ${filteredResult.length} valid appointments`);

    return filteredResult;
  } catch (error) {
    console.error("Error in getLeaveByUserID:", error);
    throw error;
  }
};

const deleteMultipleLeave = async (data_id, semester_id, timeslots) => {
  try {
    // Use map to return promises inside Promise.all for deletion
    const results = await Promise.all(
      timeslots.map(async ({ timeslots_id, dates }) => {
        const date = new Date(dates);
        date.setHours(0, 0, 0, 0);

        const findSchedule = await Leave.findOne({
          where: {
            data_id: data_id,
            timeslots_id: timeslots_id,
            semester_id: semester_id,
            date: date,
          },
        });

        if (!findSchedule) {
          return {
            success: false,
            message: `Schedule not found for timeslot: ${timeslots_id} on date: ${dates}`,
          };
        }

        // Delete the schedule
        await findSchedule.destroy();
        return {
          success: true,
          message: `Schedule with timeslot: ${timeslots_id} deleted successfully`,
        };
      })
    );

    // Log results and return successful deletions
    results.forEach((result) => console.log(result.message));
    return {
      success: true,
      deletedCount: results.filter((r) => r.success).length,
      results: results,
    };
  } catch (err) {
    console.error("Error in deleteMultipleLeave:", err);
    throw err;
  }
};

const deleteAllLeave = async (data_id, semester_id) => {
  try {
    // Delete all leaves matching the criteria
    const result = await Leave.destroy({
      where: {
        data_id: data_id,
        semester_id: semester_id,
      },
    });

    return {
      success: true,
      message: `Successfully deleted ${result} schedules`,
      deletedCount: result,
    };
  } catch (err) {
    console.error("Error in deleteAllLeave:", err);
    throw err;
  }
};

const getLeaveByDataId = async (data_id, status) => {
  try {
    // console.log(data_id);

    const leaves = await Leave.findAll({
      where: {
        data_id: data_id,
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });
    // console.log(leaves);

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        console.log(user.users_id);

        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        console.log(leave.status);

        if (leave.status !== status) {
          console.log(`Leave status is not ${status}`);
          return null;
        }

        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    // Filter out null values from the result
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};

const getLeaveByEmail = async (email, status) => {
  try {
    const data = await Datas.findOne({
      where: {
        email: email,
      },
    });
    if (!data) {
      console.log("Data not found with email:", email);
      return [];
    }

    const leaves = await Leave.findAll({
      where: {
        data_id: data.data_id, // ใช้ data_id จาก user ที่ค้นหาด้วย email
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        console.log(user.users_id);

        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        console.log(leave.status);

        if (leave.status !== status) {
          console.log(`Leave status is not ${status}`);
          return null;
        }

        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};


const getLeavestatusByUserID = async (id, status) => {
  try {

    const user = await User.findOne({
      where: {
        users_id: id,
      },
    });
    if (!user) {
      console.log("User not found with id:", id);
      return [];
    }
    const email = user.email;

    const data = await Datas.findOne({
      where: {
        email: email,
      },
    });
    if (!data) {
      console.log("Data not found with email:", email);
      return [];
    }

    const leaves = await Leave.findAll({
      where: {
        data_id: data.data_id, // ใช้ data_id จาก user ที่ค้นหาด้วย email
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        // console.log(user.users_id);

        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        console.log(leave.status);

        if (leave.status !== status) {
          console.log(`Leave status is not ${status}`);
          return null;
        }

        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};

const getallstatusLeaveByDataId = async (data_id, status) => {
  try {
    const leaves = await Leave.findAll({
      where: {
        data_id: data_id,
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        if (leave.status === status) {
          console.log(`Leave status is ${status}`);
          return null;
        }
        console.log(leave.feedback);

        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    // Filter out null values from the result
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};

const getallstatusLeaveByEmail = async (email, status) => {
  try {
    // ค้นหา user จาก email ก่อน
    const targetUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!targetUser) {
      console.log("User not found with email:", email);
      return [];
    }

    const leaves = await Leave.findAll({
      where: {
        data_id: targetUser.data_id, // ใช้ data_id จาก user ที่ค้นหาด้วย email
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        if (leave.status === status) {
          console.log(`Leave status is ${status}`);
          return null;
        }
        console.log(leave.feedback);

        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    // Filter out null values from the result
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};

const getallstatusLeaveByUserid = async (user_id, status) => {
  try {
    // ค้นหา user จาก email ก่อน
    const targetUser = await User.findOne({
      where: {
        users_id: user_id,
      },
    });

    if (!targetUser) {
      console.log("User not found with email:", user_id);
      return [];
    }
    const data = await Datas.findOne({
      where: {
       email: targetUser.email
      },
    });
    if (!data) {
      console.log("Data not found with email:", user_id);
      return [];
    }
    const leaves = await Leave.findAll({
      where: {
        data_id: data.data_id, // ใช้ data_id จาก user ที่ค้นหาด้วย users_id
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time", "dayofweek"],
        },
      ],
    });

    // Process and filter out null values
    const result = await Promise.all(
      leaves.map(async (leave) => {
        const user = await User.findOne({
          where: {
            users_id: leave.users_id,
          },
        });
        if (!user) {
          console.log("User not found for leave:", leave.users_id);
          return null; // Return null for filtering later
        }
        if (leave.status === status) {
          console.log(`Leave status is ${status}`);
          return null;
        }
        console.log(leave.feedback);
        console.log(user.email);
        
        return {
          timeslots_id: leave.timeslots_id,
          start_time: leave.Timeslot.start_time,
          end_time: leave.Timeslot.end_time,
          dayofweek: leave.Timeslot.dayofweek,
          date: leave.date,
          status: leave.status,
          studentName: user.name,
          studentEmail: user.email,
          semester_id: leave.semester_id,
          detail: leave.detail,
          feedback: leave.feedback ? leave.feedback : "No feedback",
        };
      })
    );

    // Filter out null values from the result
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      message: "An error occurred while fetching booking data",
      error: error.message,
    };
  }
};

const editLeaveStatus = async (
  data_id,
  semester_id,
  timeslots_id,
  status,
  feedback
) => {
  try {
    const findSchedule = await Leave.findOne({
      where: {
        data_id: data_id,
        timeslots_id: timeslots_id,
        semester_id: semester_id,
      },
    });
    if (findSchedule.status === status) {
      return { message: `Leave status is already ${status}` };
    }
    if (!findSchedule) {
      throw new Error(`Leave with data_id: ${data_id} not found`);
    }
    if (feedback) {
      findSchedule.feedback = feedback;
    }
    findSchedule.status = status;
    await findSchedule.save();
    return {
      message: `Leave with data_id: ${data_id} updated status ${status} successfully`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const editLeavebyuseridStatus = async (
  user_id,
  semester_id,
  timeslots_id,
  status,
  feedback
) => {
  try {
    if (!user_id) {
      throw new Error("user_id is required");
    }
    const user = await User.findOne({
      where: {
        users_id: user_id,
      }
    })
    const data = await Datas.findOne({
      where: {
        email: user.email
      },
    })
    console.log(data.data_id);
    
    if (!data) {
      throw new Error(`Data with user_id: ${user_id} not found`);
    }
    const findSchedule = await Leave.findOne({
      where: {
        data_id: data.data_id,
        timeslots_id: timeslots_id,
        semester_id: semester_id,
      },
    });
    if (findSchedule.status === status) {
      return { message: `Leave status is already ${status}` };
    }
    if (!findSchedule) {
      throw new Error(`Leave with data_id: ${data.data_id} not found`);
    }
    if (feedback) {
      findSchedule.feedback = feedback;
    }
    findSchedule.status = status;
    await findSchedule.save();
    return {
      message: `Leave with data_id: ${data.data_id} updated status ${status} successfully`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  createMultipleLeave,
  getLeaveByUserID,
  getLeaveByDataId,
  editLeaveStatus,
  getallstatusLeaveByDataId,
  deleteAllLeave,
  deleteMultipleLeave,
  getLeaveByEmail,
  getallstatusLeaveByEmail,
  getLeavestatusByUserID,
  editLeavebyuseridStatus,
  getallstatusLeaveByUserid
};
