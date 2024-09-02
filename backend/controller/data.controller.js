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
const createdatafromfile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Extract emails from the imported data
    const importedEmails = new Set(data.map(item => item.email));

    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      for (const item of data) {
        const [record, created] = await Datas.findOrCreate({
          where: { email: item.email },
            defaults: {
              name: item.name,
              tel: item.tel || null,
              image: item.image || null,
              major: item.major || null, // Ensure major is set to null if not provided
              available: item.available || 'on', // Ensure available is set to 'on' if not provided
            },
            transaction
          });
          //   Generate the weekly schedule
          if (!created) {
            // Update existing record
            await record.update({
              name: item.name,
              tel: item.tel || null,
              image: item.image || null,
              major: item.major || null, // Ensure major is set to null if not provided
              available: item.available || 'on', // Ensure available is set to 'on' if not provided
            }, { transaction });
            continue;
          }
          const schedulesData = generateWeeklySchedule(record.dataValues.data_id);
  
      // Bulk insert the generated schedules
      await Schedule.bulkCreate(
        schedulesData.map(([date, data_id, timeslots_id]) => ({
          date,
          data_id,
          timeslots_id,
        }))
      ); 
      }

      // Delete records not in the imported data
      await Data.destroy({
        where: {
          email: {
            [Op.notIn]: Array.from(importedEmails)
          }
        },
        transaction
      });

      // Commit the transaction
      await transaction.commit();
      res.status(200).json({ message: "Data imported, updated, and cleaned up successfully." });
    } catch (err) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      console.error("Transaction error:", err);
      res.status(500).json({ message: "Transaction error: " + err.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error importing data: " + error.message });
  }
}
module.exports = {createdata,createdatafromfile};