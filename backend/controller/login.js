const path = require("path");

module.exports.pageLogin = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/login.html"));
}