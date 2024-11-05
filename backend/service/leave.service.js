const { start } = require("repl");
const Leave = require("../model/leave");
const Slot = require("../model/timeslot");
const Datas = require("../model/data");
const User = require("../model/user");

const createMultipleLeave = async (data_id, semester_id, timeslots, status) => {
    try {
        // Use map to return promises inside Promise.all
        const results = await Promise.all(timeslots.map(async ({timeslots_id,dates}) => {
            
            console.log(`date: ${dates}`);
            
            const date = new Date(dates);
            date.setHours(0, 0, 0, 0);
            
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
        console.log('Fetching appointments for user:', users_id);
        
        const appointment = await Leave.findAll({
            where: {
                users_id: users_id
            },
            order: [['date', 'DESC']] // Sort by date descending
        });

        console.log(`Found ${appointment.length} appointments`);
        
        const result = await Promise.all(appointment.map(async appointment => {
            const slot = await Slot.findByPk(appointment.timeslots_id);
            const teacher = await Datas.findByPk(appointment.data_id);
            const user = await User.findByPk(users_id);
            
            if (!slot || !teacher || !user) {
                console.log('Missing related data:', {
                    slot: !!slot,
                    teacher: !!teacher,
                    user: !!user
                });
                return null;
            }

            const appointmentDate = new Date(appointment.date);
            const day = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
            
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
                username: user.name,
                useremail: user.email
            };
        }));

        // Filter out any null results from missing data
        const filteredResult = result.filter(item => item !== null);
        console.log(`Returning ${filteredResult.length} valid appointments`);
        
        return filteredResult;
    } catch (error) {
        console.error('Error in getLeaveByUserID:', error);
        throw error;
    }
};

module.exports = {createMultipleLeave, getLeaveByUserID}
