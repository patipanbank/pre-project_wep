const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const { DataTypes, Op } = require("sequelize");
const {connection,connection_server} = require("./backend/config/db");
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
const dataRoute = require('./backend/routes/data.route');
const { initializeWebSocket } = require('./backend/service/ws.service');
const WebSocket = require('ws');
const http = require("http");

const app = express();
// const isAuthenticated = require('./backend/middleware/authenticated');
app.use(cookieParser());
const corsOptions = {
  origin: 'http://localhost:3001', // Replace with your frontend's origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app); // Create an HTTP server
initializeWebSocket(server);

// app.use((req, res, next) => {
//   const userId = req.cookies.user_id;
//   if (!userId && !['/login', '/auth', '/auth/google', '/auth/callback'].includes(req.path)) {
//       return res.redirect('/login');
//   }
//   next();
// });

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
      const { data_id, name, email, tel, image, major, available, status } = row;

      // Upsert data into Datas table (update if exists, insert if not)
      await Datas.upsert({
        data_id,
        name,
        email,
        tel,
        image,
        major,
        available: available || 'on', // Set default value if not provided
        status: status || 'out_office', // Set default status if not provided
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



app.get('/download-template', async (req, res) => {
  try {
    // Fetch all records from the database
    const teachers = await Datas.findAll({
      attributes: ['data_id', 'name', 'email', 'tel', 'image', 'major', 'available', 'status']
    });

    // Convert Sequelize model data to plain object
    const templateData = teachers.map(teacher => ({
      data_id: teacher.data_id,
      name: teacher.name,
      email: teacher.email,
      tel: teacher.tel,
      image: teacher.image,
      major: teacher.major,
      available: teacher.available,
      status: teacher.status // Add the status field here
    }));

    // Create a new workbook
    const wb = xlsx.utils.book_new();

    // Create a worksheet from the template data
    const ws = xlsx.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = {
      A: 10,  // data_id
      B: 30,  // name
      C: 30,  // email
      D: 15,  // tel
      E: 50,  // image
      F: 25,  // major
      G: 10,  // available
      H: 20   // status
    };

    ws['!cols'] = Object.keys(colWidths).map(key => ({
      wch: colWidths[key]
    }));

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(wb, ws, "Teachers Data");

    // Create the buffer for the Excel file
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for the file download
    res.setHeader('Content-Disposition', 'attachment; filename=teachers_data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the buffer as the response
    res.send(buf);
  } catch (error) {
    console.error('Error creating template with data:', error);
    res.status(500).json({ message: 'Error creating template file: ' + error.message });
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
      attributes: ['data_id', 'name', 'email', 'tel', 'image', 'major', 'available', 'status'] // Include available
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

app.get('/data/count/:status/available', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['in_office', 'out_office', 'Leave', 'all'];  // Include 'all'

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let whereClause = { available: 'on' };
    
    if (status !== 'all') {
      whereClause.status = status;
    }

    const count = await Datas.count({
      where: whereClause
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching data count for status:', error);
    res.status(500).json({ message: 'Error fetching data count for status: ' + error.message });
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

app.put('/data/:id/status', async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['in_office', 'out_office', 'Leave'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({
              success: false,
              message: 'Invalid status value',
              currentStatus: (await Datas.findByPk(id))?.status
          });
      }

      // Find and update the record
      const data = await Datas.findByPk(id);
      if (!data) {
          return res.status(404).json({
              success: false,
              message: 'Record not found'
          });
      }

      // Update status and last_checkin if status is changing
      const updates = {
          status,
          last_checkin: status === 'in_office' ? new Date() : data.last_checkin
      };

      await data.update(updates);

      res.json({
          success: true,
          message: 'Status updated successfully',
          data: {
              id,
              status,
              last_checkin: updates.last_checkin
          }
      });

  } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
      });
  }
});



connection.sync({ alter: true })
  .then(() => console.log('Database connected and synced...')).then(()=>{
    connection_server.sync({ alter: true })
    .then(() => console.log('Database Server connected and synced...'))
    .catch(err => console.log('Error: ' + err));
  })
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
app.use('/api/data', dataRoute);


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});