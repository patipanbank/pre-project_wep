const Schedule = require('../model/schedule');
const Slot = require('../model/timeslot');

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

module.exports = {getSlotbydata_id}