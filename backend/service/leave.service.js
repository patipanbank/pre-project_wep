const { start } = require("repl");
const Leave = require("../model/leave");
const Slot = require("../model/timeslot");
const Datas = require("../model/data");
const User = require("../model/user");

const createMultipleLeave = async (data_id, semester_id, timeslots, status) => {
    // console.log(timeslots);
    // console.log("data_id: " + data_id);
    try {
        // Use map to return promises inside Promise.all
        const results = await Promise.all(timeslots.map(async ({timeslots_id,dates}) => {
            
            console.log(`date: ${dates}`);
            
            const date = new Date(dates);
            // console.log(`Dates: ${date}`);
           date.setDate(date.getDate()+1)
            const findSchedule = await Leave.findOne({
                where: {
                    data_id: data_id,
                    timeslots_id: timeslots_id,
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

            const res = await Leave.create({
                status: status,
                timeslots_id: timeslots_id,
                data_id: data_id,
                semester_id: semester_id,
                date:date
            });

            

            console.log(`Date ${res.date}`);
            
            return res ? { message: `Schedule with data_id: ${data_id} created successfully` } : null;
        }));
        
         
   results.forEach(result => console.log(`Input: ${result.message}`));
        return results.filter(Boolean);  // Return only successful results
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const getLeaveByUserID = async (users_id) => {
    try {
        console.log(users_id);
        
        const appointment = await Leave.findAll({
            where: {
                users_id
            }
        });
        const result = await Promise.all( appointment.map( async appointment =>  {
            // const schedule73 = schedules.find(schedule => schedule.timeslots_id === 73);
            const slot = await Slot.findByPk(appointment.timeslots_id)
            const teacher = await Datas.findByPk(appointment.data_id)
            const user = await User.findByPk(users_id)
            // console.log('leave: ',leave);
            // console.log('schedule: ',schedule73);
             // Convert appointment.date to a Date object
             const appointmentDate = new Date(appointment.date);
            
             // Get the day of the week as a string (e.g., "Monday")
             const day = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
         
            return {
                users_id: appointment.users_id,
                timeslots_id: slot.timeslots_id,
                data: appointmentDate,
                day: day,
                time: `${slot.start_time} - ${slot.end_time}`,
                status: appointment.status,
                detail: appointment.detail,
                feedback: appointment.feedback,
                teacher_id: teacher.data_id,
                teacher_name: teacher.name,
                username: user.name,
                useremail: user.email
            }
          })
        )
        return result

    } catch (error) {
        console.error(error);
    }
}

module.exports = {createMultipleLeave, getLeaveByUserID}
