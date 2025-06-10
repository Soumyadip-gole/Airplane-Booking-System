const express = require('express');
const router = express.Router();

const flightController = require('../controller/flights');
router.get('/search',flightController.searchallflights)
router.get('/getone', flightController.searchoneflight);

module.exports = router;