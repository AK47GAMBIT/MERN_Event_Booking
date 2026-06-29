const Event = require('../models/event.model');

exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id,  // was missing, required in schema
        });
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketPrice) {
            filters.ticketPrice = req.query.ticketPrice;
        }
        if (req.query.search) {
            filters.title = { $regex: req.query.search, $options: 'i' };
        }
        const events = await Event.find(filters);
        res.status(200).json(events); // plain array
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        // was checking !event before fetching it, and using wrong method
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, date, location, category, totalSeats, ticketPrice, imageUrl },
            { new: true }
        );
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        // was using findOneAndDelete with a plain id instead of filter object
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};