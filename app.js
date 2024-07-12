const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const { raw } = require("mysql2");
const login = require('./backend/routes/login');
const student = require('./backend/routes/student');
const teacher = require('./backend/routes/teacher');
const admin = require('./backend/routes/admin');
const staff = require('./backend/routes/staff');

var cors = require('cors')

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
   // Allow cookies to be sent
}))
app.use(express.urlencoded({ extended: true }));
app.use("/", login);
app.use("/student", student);
app.use("/teacher", teacher);
app.use("/admin", admin);
app.use("/staff", staff);



const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server is runnint at port " + PORT);
});