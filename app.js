const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const { DataTypes, Op } = require("sequelize");
const sequelize = require("./backend/config/db");
const Datas = require("./backend/model/data");
const Schedule = require("./backend/model/schedule");
const { generateWeeklySchedule } = require('./backend/service/schedule.service');
const login = require('./backend/routes/login');
const { createdata, createdatafromfile } = require('./backend/controller/data.controller');
const student = require('./backend/routes/student');
const teacher = require('./backend/routes/teacher');
const admin = require('./backend/routes/admin');
const staff = require('./backend/routes/staff');
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

app.post("/import", upload.single("file"), async (req, res) => {
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

        if (!created) {
          // Update existing record
          await record.update({
            name: item.name,
            tel: item.tel || null,
            image: item.image || null,
            major: item.major || null, // Ensure major is set to null if not provided
            available: item.available || 'on', // Ensure available is set to 'on' if not provided
          }, { transaction });
        }

        // Generate the weekly schedule
        const schedulesData = generateWeeklySchedule(record.dataValues.data_id);

        // Bulk insert the generated schedules
        await Schedule.bulkCreate(
          schedulesData.map(([date, data_id, timeslots_id]) => ({
            date,
            data_id,
            timeslots_id,
          })),
          { transaction }
        );
      }

      // Delete records not in the imported data
      await Datas.destroy({
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

app.get('/schedules/:data_id', async (req, res) => {
  try {
    const { data_id } = req.params; // Extract data_id from the URL parameters

    const data = await Schedule.findAll({
      where: { data_id }, // Use the extracted data_id in your query
      attributes: ['schedules_id', 'date', 'created_at', 'updated_at', 'data_id', 'timeslots_id', 'status']
    });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No schedule found for the given data_id" });
    }

  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Error fetching schedules: " + error.message });
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

app.post('/data', createdata);
app.post('/data/file', createdatafromfile);

sequelize.sync({ alter: true })
  .then(() => console.log('Database connected and synced...'))
  .catch(err => console.log('Error: ' + err));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use("/", login);
app.use("/student", student);
app.use("/teacher", teacher);
app.use("/admin", admin);
app.use("/staff", staff);

const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("Server is running at port " + PORT);
});
