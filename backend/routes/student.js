const express = require('express');
const router = express.Router();
const page = require('../controller/student');
router.get("/homepage", page.homepage );
router.get("/appointment", page.appointment );
// router.get("/appointment/:id", appointment);
router.get("/statusappointment", page.statusappointment );
module.exports = router;