const Schedule = require('../model/schedule');
const Slot = require('../model/timeslot');
const Leave = require('../model/leave');
const { Op } = require('sequelize'); // Ensure Sequelize operators are imported

const getSlotbydata_id = async (data_id,semester_id) => {
    try {
        console.log(data_id+""+semester_id);
        const slots = await Slot.findAll();
        const schedules = await Schedule.findAll({
            where:{
                data_id:data_id,
                semester_id:semester_id
            }
        });
        const result = slots.map(slot => {
            const schedule = schedules.find(schedule => schedule.timeslots_id === slot.timeslots_id);
            return {
                timeslots_id: slot.timeslots_id,
                start_time: slot.start_time,
                end_time: slot.end_time,
                dayofweek: slot.dayofweek,
                status: schedule ? schedule.status : 'Empty'
            }
        })
        return result;
    } catch (error) {
        console.error(error); 
        throw error       
    }
}

const leaveSlot = async (data_id, semester_id, start_date, end_date) => {
  try {
    const slots = await Slot.findAll();
    const leaves = await Leave.findAll({
      where: {
        data_id: data_id,
        semester_id: semester_id,
        date: {
          [Op.between]: [start_date, end_date], // Check if the `date` is between the provided range
        }
      }
    });

    // console.log('leaves: ',leaves);
    
    const result = slots.map(slot => {
        const leave = leaves.find(leave => leave.timeslots_id === slot.timeslots_id);
        // console.log('leaveid: ',leave.data_id);
        
        // console.log('Output: ',leave);

        return {
            timeslots_id: slot.timeslots_id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            dayofweek: slot.dayofweek,
            date: leave ? leave.date : null,
            status: leave ? leave.status : 'Empty'
        }

    })
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const leavescheduleSlot = async (data_id, semester_id, start_date, end_date) => {
  try {
    const slots = await Slot.findAll();
    console.log(data_id, semester_id, start_date, end_date);
    const schedules = await Schedule.findAll({
      where: {
        data_id: data_id,
        semester_id: semester_id,
      }
    });
    console.log('schedules: ',schedules);
    const leaves = await Leave.findAll({
      where: {
        data_id: data_id,
        semester_id: semester_id,
        date: {
          [Op.between]: [start_date, end_date], // Check if the `date` is between the provided range
        }
      }
    });
    const result = slots.map(slot => {
      const schedule = schedules.find(schedule => schedule.timeslots_id === slot.timeslots_id);
      const leave = leaves.find(leave => leave.timeslots_id === slot.timeslots_id);
      // console.log('leave: ',leave);
      // console.log('schedule: ',schedule);
      let status = 'Available'
      if (leave) {
        if (leave.status !== 'Available' || leave.status !== 'Empty') {
          status = 'Unavailable'
        }
      }
      return {
        timeslots_id: slot.timeslots_id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        dayofweek: slot.dayofweek,
        status: status
      }
    });
    return result;
  } catch (error) {
    
  }
}

module.exports = {getSlotbydata_id, leaveSlot, leavescheduleSlot}