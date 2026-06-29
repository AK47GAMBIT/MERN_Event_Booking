const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], // fixed: was missing 'confirmed', had wrong 'booked'
        default: 'pending'
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    numberOfTickets: { type: Number, required: true },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);