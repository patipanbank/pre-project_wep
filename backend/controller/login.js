const path = require("path");
const connection = require('../config/db');

module.exports.pageLogin = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../../views/login.html"));
}
module.exports.auth = (req, res) => {
    connection.query(
        'SELECT * FROM `user`',
        function(err, results, fields) {
          res.json(results);
        }
      );
}
