const{createBooking, getBookings, getBookingById, cancelBooking, updateBooking}= require('../controller/booking');
const express = require('express');
const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', cancelBooking);

module.exports = router;