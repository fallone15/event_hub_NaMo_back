const express = require('express');
const router = express.Router();
const {
  requireLogin,
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const {
  isRegisteredToEvent
} = require('../controllers/attendance_controller');

// ✅ Route pour récupérer les événements
router.get('/', getEvents);

// ✅ Auth-required routes
router.post('/', requireLogin, createEvent);
router.get('/:id', requireLogin, getEventById);
router.put('/:id', requireLogin, updateEvent);
router.delete('/:id', requireLogin, deleteEvent);

// ✅ À placer après les autres (évite les conflits)
router.get('/:eventId/registration-status/:userId', isRegisteredToEvent);

module.exports = router;
