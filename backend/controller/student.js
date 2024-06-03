const path = require("path");

module.exports.homepage = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/student/student_homepage.html"));
}
module.exports.appointment = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/student/student_appointment.html"));
}
module.exports.statusappointment = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/student/student_statusappointment.html"));
}