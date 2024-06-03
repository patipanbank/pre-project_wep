const express = require('express');
const router = express.Router();
const login = require('../controller/login');
router.get("/login", login.pageLogin );
module.exports = router;