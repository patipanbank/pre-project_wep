const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const { DataTypes, Op } = require("sequelize");
const sequelize = require("./backend/config/db");
const Datas = require("./backend/model/data");
const login = require('./backend/routes/login');
const student = require('./backend/routes/student');
const teacher = require('./backend/routes/teacher');
const admin = require('./backend/routes/admin');
const staff = require('./backend/routes/staff');
const timeslotRoutes = require('./backend/routes/timeslot.routes');
const Semester = require("./backend/model/semester");
const semesterRoutes = require('./backend/routes/semester.routes'); 

const app = express();

const corsOptions = {
  origin: 'http://localhost:3001', // Replace with your frontend's origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/import', upload.single('file'), async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Parse the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Extract emails from the uploaded file
    const emailsFromFile = jsonData.map(row => row.email);

    // Fetch all existing records from the database
    const existingRecords = await Datas.findAll({ attributes: ['email', 'data_id'] });
    const existingEmails = existingRecords.map(record => record.email);

    // Update or insert data
    for (const row of jsonData) {
      const { data_id, name, email, tel, image, major, available } = row;

      // Upsert data into Datas table (update if exists, insert if not)
      await Datas.upsert({
        data_id,
        name,
        email,
        tel,
        image,
        major,
        available: available || 'on', // Set default value if not provided
      });
    }

    // Delete records that are no longer in the file
    const emailsToDelete = existingEmails.filter(email => !emailsFromFile.includes(email));
    if (emailsToDelete.length > 0) {
      await Datas.destroy({
        where: {
          email: emailsToDelete
        }
      });
    }

    res.status(200).json({ message: 'Data imported and cleaned up successfully.' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ message: 'Error importing data: ' + error.message });
  }
});


app.get('/data/images/:data_id', async (req, res) => {
  try {
    const data_id = req.params.data_id; // Get data_id from the request params
    const data = await Datas.findOne({
      where: { data_id: data_id },
      attributes: ['name', 'tel', 'image', 'major', 'email'] // Only fetch required fields
    });

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
});

app.get('/data/images', async (req, res) => {
  try {
    const data = await Datas.findAll({
      attributes: ['data_id', 'name', 'email', 'tel', 'image', 'major', 'available'] // Include available
    });
    console.log(data); // Log the fetched data to see if IDs are correct
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
});

app.get('/semester/all', async (req, res) => {
  
  try {
    const data = await Semester.findAll({
      attributes: ['semester_id', 'term', 'year', 'start_date', 'end_date'] // Include available
    });
    console.log(data); // Log the fetched data to see if IDs are correct
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
});


app.get('/data/count/available', async (req, res) => {
  try {
    const count = await Datas.count({
      where: {
        available: 'on'
      }
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching available data count:', error);
    res.status(500).json({ message: 'Error fetching available data count: ' + error.message });
  }
});

app.put('/data/:id/available', async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  console.log(`Received ID: ${id}`);
  console.log(`Received available status: ${available}`);

  try {
    const record = await Datas.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    record.available = available;
    await record.save();

    res.status(200).json({ message: 'Availability updated successfully.' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating availability: ' + error.message });
  }
});

sequelize.sync({ alter: true })
  .then(() => console.log('Database connected and synced...'))
  .catch(err => console.log('Error: ' + err));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// app.use("/schedule",schedule) 
app.use("/", login);
app.use("/student", student);
app.use("/teacher", teacher);
app.use("/admin", admin);
app.use("/staff", staff);
app.use('/api/semesters', semesterRoutes);
app.use('/api', timeslotRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("Server is running at port " + PORT);
});






// app.delete('/schedules/cleanup', async (req, res) => {
//   try {
//     const deletedCount = await Schedule.destroy({
//       where: { data_id: null }
//     });

//     res.status(200).json({ message: `${deletedCount} schedules with null data_id deleted.` });
//   } catch (error) {
//     console.error('Error during schedule cleanup:', error);
//     res.status(500).json({ message: 'Error during schedule cleanup: ' + error.message });
//   }
// });

// app.get('/schedules/:data_id', async (req, res) => {
//   try {
//     const { data_id } = req.params;
//     const { startDate, endDate } = req.query; // Extract date range from query parameters

//     let whereClause = { data_id };

//     // Add date range to where clause if both startDate and endDate are provided
//     if (startDate && endDate) {
//       whereClause.date = {
//         [Op.between]: [new Date(startDate), new Date(endDate)]
//       };
//     }

//     const data = await Schedule.findAll({
//       where: whereClause,
//       attributes: ['schedules_id', 'date', 'created_at', 'updated_at', 'data_id', 'timeslots_id', 'status']
//     });

//     if (data.length > 0) {
//       res.status(200).json(data);
//     } else {
//       res.status(404).json({ message: "No schedules found for the given criteria" });
//     }
//   } catch (error) {
//     console.error("Error fetching schedules:", error);
//     res.status(500).json({ message: "Error fetching schedules: " + error.message });
//   }
// });

// app.post("/import", upload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     const { startDate } = req.body; // Capture the start date from the request body

//     if (!file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     if (!startDate) {
//       return res.status(400).send("Start date is required.");
//     }

//     const workbook = xlsx.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     const importedEmails = new Set(data.map(item => item.email));
//     const importedDataIds = new Set(data.map(item => item.data_id));

//     const transaction = await sequelize.transaction();
//     try {
//       // Track which data_ids have been processed
//       const processedDataIds = new Set();

//       for (const item of data) {
//         const [record, created] = await Datas.findOrCreate({
//           where: { data_id: item.data_id }, // Use data_id from import data
//           defaults: {
//             name: item.name,
//             email: item.email,
//             tel: item.tel || null,
//             image: item.image || null,
//             major: item.major || null,
//             available: item.available || 'on',
//           },
//           transaction,
//         });

//         if (!created) {
//           await record.update({
//             name: item.name,
//             tel: item.tel || null,
//             image: item.image || null,
//             major: item.major || null,
//             available: item.available || 'on',
//           }, { transaction });
//         }

//         const data_id = record.dataValues.data_id;
//         processedDataIds.add(data_id);

//         // Generate new weekly schedules based on startDate
//         const newSchedulesData = generateWeeklySchedule(data_id, startDate);
//         const newScheduleDates = new Set(newSchedulesData.map(([date]) => date.toISOString()));

//         // Fetch existing schedules for this data_id
//         const existingSchedules = await Schedule.findAll({
//           where: { data_id },
//           transaction,
//         });

//         // Calculate the number of weeks already covered
//         const existingScheduleDates = new Set(existingSchedules.map(schedule => new Date(schedule.date).toISOString()));
//         const existingWeeks = new Set(existingSchedules.map(schedule => {
//           const date = new Date(schedule.date);
//           const weekNumber = Math.floor((date - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7));
//           return weekNumber;
//         }));

//         // Determine weeks to be added
//         const weeksToAdd = new Set();
//         for (let week = 0; week < 24; week++) {
//           if (!existingWeeks.has(week)) {
//             weeksToAdd.add(week);
//           }
//         }

//         // Update existing schedules
//         const updates = [];
//         for (const schedule of existingSchedules) {
//           const currentDateISO = new Date(schedule.date).toISOString();
//           if (newScheduleDates.has(currentDateISO)) {
//             // Find the corresponding new date
//             const newDate = newSchedulesData.find(([date]) => date.toISOString() === currentDateISO)[0];
//             updates.push(schedule.update({
//               date: newDate,
//               updated_at: new Date(), // Update the timestamp
//             }, { transaction }));
//           }
//         }

//         await Promise.all(updates);

//         // Create missing schedules only for weeks not covered
//         if (weeksToAdd.size > 0) {
//           const schedulesToCreate = [];
//           for (const week of weeksToAdd) {
//             const weekStartDate = new Date(startDate);
//             weekStartDate.setDate(weekStartDate.getDate() + week * 7);

//             for (let day = 0; day < 5; day++) {
//               for (let slot = 0; slot < 18; slot++) {
//                 let timeslots_id = slot + 1 + day * 18;
//                 let date = new Date(weekStartDate);
//                 date.setDate(weekStartDate.getDate() + day);
//                 date.setHours(8 + Math.floor(slot / 2)); // Assuming slots are 30 minutes each
//                 date.setMinutes((slot % 2) * 30); // Set minutes to 0 or 30

//                 schedulesToCreate.push({
//                   date,
//                   data_id, // Use the existing data_id
//                   timeslots_id,
//                   status: 'Empty', // Default status or adjust as needed
//                 });
//               }
//             }
//           }

//           if (schedulesToCreate.length > 0) {
//             await Schedule.bulkCreate(schedulesToCreate, { transaction });
//           }
//         }

//         // Delete old schedules that are older than the selected startDate
//         await Schedule.destroy({
//           where: {
//             data_id,
//             date: {
//               [Op.lt]: new Date(startDate), // Remove schedules older than startDate
//             },
//           },
//           transaction,
//         });

//         // Delete schedules that are beyond the 24-week period
//         const endDate = new Date(startDate);
//         endDate.setDate(endDate.getDate() + (24 * 7 * 1)); // Adding 24 weeks

//         await Schedule.destroy({
//           where: {
//             data_id,
//             date: {
//               [Op.gt]: endDate, // Remove schedules beyond 24 weeks from startDate
//             },
//           },
//           transaction,
//         });
//       }

//       // Remove schedules with null data_id or with data_id not in importedDataIds
//       await Schedule.destroy({
//         where: {
//           [Op.or]: [
//             { data_id: { [Op.is]: null } },
//             { data_id: { [Op.notIn]: Array.from(processedDataIds) } }
//           ]
//         },
//         transaction,
//       });

//       // Remove data entries not present in the import
//       await Datas.destroy({
//         where: {
//           email: {
//             [Op.notIn]: Array.from(importedEmails),
//           },
//         },
//         transaction,
//       });

//       await transaction.commit();
//       res.status(200).json({ message: "Data imported, updated, and cleaned up successfully." });
//     } catch (err) {
//       await transaction.rollback();
//       console.error("Transaction error:", err);
//       res.status(500).json({ message: "Transaction error: " + err.message });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Error importing data: " + error.message });
//   }
// });