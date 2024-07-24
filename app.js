
const express = require("express");
const path = require("path");
const cors = require("cors");
const login = require('./backend/routes/login');
const student = require('./backend/routes/student');
const teacher = require('./backend/routes/teacher');
const admin = require('./backend/routes/admin');
const staff = require('./backend/routes/staff');
const connection = require('./backend/config/db');
const app = express();

const corsOptions = {
  origin: 'http://localhost:3001', // Replace with your frontend's origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sync Database
connection.sync()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

app.use("/", login);
app.use("/student", student);
app.use("/teacher", teacher);
app.use("/admin", admin);
app.use("/staff", staff);

const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("Server is running at port " + PORT);
});
