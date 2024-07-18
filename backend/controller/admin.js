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


