const jsonfile = require('jsonfile');
const path = require('path');
const _ = require('lodash');

/**
 * Airports JSON data courtesy of https://github.com/jbrooksuk/JSON-Airports
 */

class AirportInterface {
    constructor() {}

    static allAirports() {
        let rsp = { airports: [] };
        let airports = jsonfile.readFileSync(path.join(__dirname, '../data/airports.json'));
        rsp.airports = _.reduce(airports, (results, airport) => {
            if(1 === airport.status && 'airport' === airport.type && 'NA' === airport.continent && 'large' === airport.size)
                results.push(airport);
            return results
        }, []);
        return rsp;
    }

    static earliestItinerary(params = {}) {
        if(_.isEmpty(params))
            return [];
        return [
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
    }
}

module.exports = AirportInterface;