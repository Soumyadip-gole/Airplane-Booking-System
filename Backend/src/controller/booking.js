const booking = require('../model/booking');
require('dotenv').config();

const createBooking = async (req, res) => {
    try {
        const { flightNumber, airline, flightDate, depIata, arrIata, depTime, arrTime, tier } = req.body;
        const userId = req.user.id;

        const newBooking = await booking.create({
            flightNumber,
            airline,
            flightDate,
            depIata,
            arrIata,
            depTime,
            arrTime,
            tier,
            userId
        });
        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await booking.findAll({
            where: { userId },
            order: [['flightDate', 'DESC']]
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for this user' });
        }

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const bookingDetails = await booking.findOne({ where: { id: bookingId } });

        if (!bookingDetails) {
            return res.status(404).json({ message: 'no such booking found' });
        }

        res.status(200).json(bookingDetails);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const bookingToCancel = await booking.findOne({ where: { id: bookingId, userId } });

        if (!bookingToCancel) {
            return res.status(404).json({ message: 'Booking not found or does not belong to this user' });
        }

        bookingToCancel.status = 'cancelled';
        await bookingToCancel.save();
        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const bookingToUpdate = await booking.findOne({ where: { id: bookingId } });

        if (!bookingToUpdate) {
            return res.status(404).json({ message: 'No such booking found' });
        }

        const { tier } = req.body;

        bookingToUpdate.tier = tier || bookingToUpdate.tier;

        await bookingToUpdate.save();
        res.status(200).json({ message: 'Booking updated successfully', booking: bookingToUpdate });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {createBooking, getBookings, getBookingById, cancelBooking, updateBooking};
