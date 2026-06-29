const Booking = require('../models/booking.model');
const OtpModel = require('../models/otp.models');
const Event = require('../models/event.model');
const { sendOTPEmail, sendBookingEmail, sendCancellationEmail } = require('../utils/email'); // ✅ added sendCancellationEmail

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
    try {
        const otpCode = generateOTP();
        await OtpModel.findOneAndDelete({
            email: req.user.email,
            action: 'event_booking',
        });
        await OtpModel.create({
            email: req.user.email,
            otp: otpCode,
            action: 'event_booking',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        await sendOTPEmail(req.user.email, otpCode, 'event_booking');
        res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp: userOtp, numberOfTickets = 1 } = req.body;

        const otpRecord = await OtpModel.findOne({
            email: req.user.email,
            otp: userOtp,
            action: 'event_booking',
            expiresAt: { $gt: new Date() },
        });
        if (!otpRecord)
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        const eventRecord = await Event.findById(eventId);
        if (!eventRecord)
            return res.status(404).json({ message: 'Event not found' });

        if (eventRecord.availableSeats <= 0)
            return res.status(400).json({ message: 'No seats available for this event' });

        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventID: eventId,
        });
        if (existingBooking)
            return res.status(400).json({ message: 'You have already booked this event' });

        const newBooking = await Booking.create({
            userId: req.user._id,
            eventID: eventId,
            status: 'pending',
            paymentStatus: 'unpaid',
            numberOfTickets,
            amount: eventRecord.ticketPrice,
        });

        await OtpModel.deleteMany({ _id: otpRecord._id });

        res.status(201).json({
            message: 'Event booked successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        if (!['paid', 'unpaid'].includes(paymentStatus))
            return res.status(400).json({ message: 'Invalid payment status' });

        const { id } = req.params;

        const bookingRecord = await Booking.findById(id)
            .populate('eventID')
            .populate('userId', 'name email');

        if (!bookingRecord)
            return res.status(404).json({ message: 'Booking not found' });

        if (bookingRecord.status === 'confirmed')
            return res.status(400).json({ message: 'Booking is already confirmed' });

        const eventRecord = await Event.findById(bookingRecord.eventID);
        if (!eventRecord)
            return res.status(404).json({ message: 'Event not found' });

        if (eventRecord.availableSeats <= 0)
            return res.status(400).json({ message: 'No seats available for this event' });

        bookingRecord.status = 'confirmed';
        bookingRecord.paymentStatus = paymentStatus;
        await bookingRecord.save();

        eventRecord.availableSeats -= 1;
        await eventRecord.save();

        // ✅ Fixed: sends to user's email with correct parameter order
        await sendBookingEmail(
            bookingRecord.userId.email,
            bookingRecord.userId.name,
            eventRecord.title
        );

        res.status(200).json({
            message: 'Booking confirmed successfully',
            booking: bookingRecord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('eventID', 'title date location availableSeats totalSeats');
        res.status(200).json({ bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('eventID', 'title availableSeats totalSeats');
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Fixed: populate userId and eventID to get details for email
        const bookingRecord = await Booking.findById(id)
            .populate('userId', 'name email')
            .populate('eventID', 'title');

        if (!bookingRecord)
            return res.status(404).json({ message: 'Booking not found' });

        // ✅ Fixed: allow admin to cancel any booking, users can only cancel their own
        if (req.user.role !== 'admin' && bookingRecord.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // ✅ restore seat if booking was confirmed
        if (bookingRecord.status === 'confirmed') {
            const eventRecord = await Event.findById(bookingRecord.eventID);
            if (eventRecord) {
                eventRecord.availableSeats += 1;
                await eventRecord.save();
            }
        }

        // ✅ New: send cancellation email to user
        await sendCancellationEmail(
            bookingRecord.userId.email,
            bookingRecord.userId.name,
            bookingRecord.eventID.title
        );

        bookingRecord.status = 'cancelled';
        await bookingRecord.save();
        await bookingRecord.deleteOne();

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};