const express = require('express');
const router = express.Router();
const {
    bookEvent,
    sendBookingOTP,
    getMyBookings,
    confirmBooking,
    cancelBooking,
    getAllBookings
} = require('../controllers/bookings.controllers');
const { protect, admin } = require('../middlewares/auth.middleware');

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, admin, getAllBookings); 
router.put('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;