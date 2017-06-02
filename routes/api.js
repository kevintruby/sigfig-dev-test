const express = require('express');
const router = express.Router();

const AirportInterface = require('../services/AirportInterface');

router.get('/availableAirports', (req, res) => {
    res.status(200).send(AirportInterface.allAirports());
});

router.get('/seed/flightData', (req, res) => {
    AirportInterface.seedFlights();
    res.status(200).send('done seeding!');
});

router.post('/earliestItinerary', (req, res) => {
    let results = AirportInterface.earliestItinerary(req.body);
    res.status(200).send(results);
});

module.exports = router;