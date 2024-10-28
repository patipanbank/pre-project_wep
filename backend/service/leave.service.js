const Leave = require("../model/leave");

const createMultipleLeave = async (data_id, semester_id, timeslots, status) => {
    // console.log(timeslots);
    // console.log("data_id: " + data_id);
    try {
        // Use map to return promises inside Promise.all
        const results = await Promise.all(timeslots.map(async ({timeslots_id,dates}) => {
            
            console.log(`date: ${dates}`);
            
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
                date:dates
            });

            

            // console.log(`Date ${res.date}`);
            
            return res ? { message: `Schedule with data_id: ${data_id} created successfully` } : null;
        }));
        
         
   results.forEach(result => console.log(`Input: ${result.message}`));
        return results.filter(Boolean);  // Return only successful results
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = {createMultipleLeave}
