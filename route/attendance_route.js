const express = require('express');
const router = express.Router();
const { rsvpToEvent } = require('../controllers/attendance_controller');

router.post('/', rsvpToEvent);

module.exports = router;