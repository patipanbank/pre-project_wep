const path = require("path");

module.exports.all = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_all.html"));
}
module.exports.editofficehours = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_editofficehours.html"));
}
module.exports.homepage = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_homepage.html"));
}
module.exports.inoffice = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_inoffice.html"));
}
module.exports.leave = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_leave.html"));
}
module.exports.manage = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_manage.html"));
}
module.exports.officehours = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_officehours.html"));
}
module.exports.outoffice = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_outoffice.html"));
}
module.exports.semester = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_semester.html"));
}
module.exports.addonleave = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_add_onleave.html"));
}
module.exports.editonleave = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_editonleave.html"));
}
module.exports.settimeout = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/admin/admin_set_timeout.html"));
}


