const Schedule = require('../model/schedule');

const getSchedulebydata_id = async (data_id,semester_id) => {
    try {
        const result =  await Schedule.findAll({
                where:{
                    data_id:data_id,
                    semester_id:semester_id
                }
            })
        return result;
    } catch (error) {
        console.error(error); 
        throw error       
    }
}

const editMultipleSchedules = async (schedules) => {
  try {
      const results = await Promise.all(schedules.map(async (schedule) => {
          const { timeslots_id, status } = schedule;
          const res = await Schedule.update(
            { status: status },
            { where: { data_id: data_id, timeslots_id: timeslots_id } }
        );
          return res ? { message: `Schedule with data_id: ${data_id} create successfully` } : null;
      }));
      return results.filter(Boolean);  // Return only successful results
  } catch (err) {
      console.error(err);
      throw err;
  }
};

const createMultipleSchedules = async (data_id, semester_id, timeslots, status) => {
    console.log(timeslots);
    console.log("data_id: " + data_id);
    try {
        // Use map to return promises inside Promise.all
        const results = await Promise.all(timeslots.map(async (timeslot) => {
            const findSchedule = await Schedule.findOne({
                where: {
                    data_id: data_id,
                    timeslots_id: timeslot,
                    semester_id: semester_id,
                }
            });
            if (findSchedule && findSchedule.status === status) {
                return { message:`Schedule is ${status} already`}; // Exit the current iteration of the loop
            }
            if (findSchedule && findSchedule.status !== status) {
                findSchedule.status = status;
                await findSchedule.save();
                return { message: `Schedule with data_id: ${data_id} updated successfully` };
            }
            const res = await Schedule.create({
                status: status,
                timeslots_id: timeslot,
                data_id: data_id,
                semester_id: semester_id,
            });
            return res ? { message: `Schedule with data_id: ${data_id} created successfully` } : null;
        }));

        return results.filter(Boolean);  // Return only successful results
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const removeMutipleSchedule = async (data_id, semester_id,timeslots) => {
    try {

        const result = await Promise.all(timeslots.map(async (timeslot) => {
            const res = await Schedule.destroy({
                where: {
                    data_id: data_id,
                    timeslots_id: timeslot,
                    semester_id: semester_id
                }
            });
            return res ? { message: `Schedule with data_id: ${data_id} removed successfully` } : null;
        }));
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {  editMultipleSchedules,createMultipleSchedules,getSchedulebydata_id,removeMutipleSchedule };
