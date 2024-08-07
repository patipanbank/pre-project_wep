const express = require('express');
const router = express.Router();
const page = require('../controller/teacher');
router.get("/homepage", page.homepage );
router.get("/history", page.history );
router.get("/editofficehours", page.editofficehours );
module.exports = router;