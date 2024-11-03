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
const Schedule = require("./backend/model/schedule");
const semesterRoutes = require('./backend/routes/semester.routes');
const leaveRoutes = require('./backend/routes/leave.route');
const scheduleRoutes = require('./backend/routes/schedule.routes');
const bookingRoutes = require('./backend/routes/booking.route');
const cookieParser = require('cookie-parser');
const loginRoute = require('./backend/routes/login');

const app = express();
app.use(cookieParser());
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

// Route for fetching semester details by ID
app.get('/semester/:id', async (req, res) => {
  try {
    const semesterId = req.params.id;
    const semester = await Semester.findByPk(semesterId);
    if (semester) {
      res.json({
        semester_id: semester.semester_id,
        term: semester.term,
        year: semester.year,
        start_date: semester.start_date,
        end_date: semester.end_date
      });
    } else {
      res.status(404).json({ error: 'Semester not found' });
    }
  } catch (error) {
    console.error('Error fetching semester details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
app.use('/api/schedule', scheduleRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', bookingRoutes);
app.use('/api/login', loginRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("Server is running at port " + PORT);
});
