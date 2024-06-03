const path = require("path");

module.exports.homepage = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/staff/staff_homepage.html"));
}
