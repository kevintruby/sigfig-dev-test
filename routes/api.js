const express = require('express');
// const request = require('request');
const router = express.Router();

router.get('/', (req, res) => {
    let results = [
        {
            "flightNumber": 117,
            "sourceAirport": "SFO",
            "destinationAirport": "OAK",
            "departureTime": "2017-01-25T22:17:05Z",
            "arrivalTime": "2017-01-25T22:21:00Z"
        },
        {
            "flightNumber": 451,
            "sourceAirport": "OAK",
            "destinationAirport": "IAD",
            "departureTime": "2017-01-26T04:01:00Z",
            "arrivalTime": "2017-01-26T10:21:00Z"
        },
        {
            "flightNumber": 453,
            "sourceAirport": "SFO",
            "destinationAirport": "IAD",
            "departureTime": "2017-01-26T04:00:00Z",
            "arrivalTime": "2017-01-26T10:24:00Z"
        }
    ];
    setTimeout(() => {
        res.status(200).send(results);
    }, 1000);
});

module.exports = router;