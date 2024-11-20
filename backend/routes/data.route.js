const {updateOfficeStatusController} = require('../controller/data.controller');

const express = require("express");
const router = express.Router();
router.put("/updateOfficeStatus", updateOfficeStatusController);

module.exports = router;