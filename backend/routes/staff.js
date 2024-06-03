const express = require('express');
const router = express.Router();
const page = require('../controller/staff');
router.get("/homepage", page.homepage );
module.exports = router;