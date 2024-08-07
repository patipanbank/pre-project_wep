const path = require("path");

module.exports.homepage = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/teacher/teacher_homepage.html"));
}
module.exports.history = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/teacher/teacher_history.html"));
}
module.exports.editofficehours = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/teacher/teacher_editofficehours.html"));
}