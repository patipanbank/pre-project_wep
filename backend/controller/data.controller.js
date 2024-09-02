const Datas = require("../model/data");
const Schedule = require("../model/schedule");
const {generateWeeklySchedule } = require('../service/schedule.service');
const createdata = async (req, res) => {
    const { name, email } = req.body;
  
    try {
      // Create a new user
      const newUser = await Datas.create({ name, email });
        if (!newUser) {
            throw new Error('Error creating new user');
        }
    console.log(`New user created: ${newUser.getDataValue('data_id')}`);
    //   Generate the weekly schedule
      const schedulesData = generateWeeklySchedule(newUser.dataValues.data_id);
  
      // Bulk insert the generated schedules
      await Schedule.bulkCreate(
        schedulesData.map(([date, data_id, timeslots_id]) => ({
          date,
          data_id,
          timeslots_id,
        }))
      );
  
      res.status(201).json({ user_id: newUser.id, schedules_created: schedulesData.length });
    } catch (err) {
      res.status(500).send(err);
    }
  }
module.exports = {createdata};