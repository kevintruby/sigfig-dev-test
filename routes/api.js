const express = require('express');
const router = express.Router();

const AirportInterface = require('../services/AirportInterface');

router.get('/availableAirports', (req, res) => {
    res.status(200).send(AirportInterface.allAirports());
});

router.post('/earliestItinerary', (req, res) => {
    let results = AirportInterface.earliestItinerary(req.body);
    res.status(200).send(results);
});

module.exports = router;