const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/events.controllers');
const { protect, admin } = require('../middlewares/auth.middleware');

router.get('/', getAllEvents);
router.post('/create', protect, admin, createEvent);
router.get('/:id', getEventById);                    
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;