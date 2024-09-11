const {Router} = require('express');

const { editScheduleController } = require('../controller/schedule.controller');

const router = Router();

router.put('/edit', editScheduleController);

module.exports = router;