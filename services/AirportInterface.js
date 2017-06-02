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
            if(1 === airport.status && 'airport' === airport.type && 'NA' === airport.continent && 'large' === airport.size && 'US' === airport.iso)
                results.push(airport);
            return results
        }, []);
        return rsp;
    }

    static earliestItinerary(params = {}) {
        if(_.isEmpty(params))
            return [];
        let available_flights = jsonfile.readFileSync(path.join(__dirname, '../data/flights.json'));
        let itinerary = [];
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

    static seedFlights() {
        let available_airports = AirportInterface.allAirports();
        available_airports = available_airports.airports;
        let flights_per_airport = 5;
        let existing_flight_numbers = [];
        let seed_data = [];

        for (let index in available_airports) {
            let airport = available_airports[index];
            let initial_timestamp = Date.now();
            for(let i = 0; i < flights_per_airport; i++) {
                let flight_number = 0;
                // this do/while loop guarantees a unique flight number for each seeded entry
                do {
                    flight_number = AirportInterface.randomNumber(999, 1);
                } while(-1 === !existing_flight_numbers.indexOf(flight_number));
                existing_flight_numbers.push(flight_number);

                let departureTime = new Date(initial_timestamp + ((AirportInterface.randomNumber(6,1, true))*3600000));
                let arrivalTime = new Date(departureTime.valueOf() + ((AirportInterface.randomNumber(6,1, true))*3600000));

                let flightObj = {
                    "flightNumber": flight_number,
                    "sourceAirport": `${airport.iata}`,
                    "destinationAirport": "",
                    "departureTime": `${departureTime.toISOString()}`,
                    "arrivalTime": `${arrivalTime.toISOString()}`
                };

                let connecting_airport_index = AirportInterface.randomNumber(available_airports.length-1, 0);
                if(connecting_airport_index === airport) {
                    if(connecting_airport_index === available_airports.length-1)
                        connecting_airport_index -= 1;
                    else connecting_airport_index += 1;
                }
                let connecting_airport = available_airports[connecting_airport_index];
                flightObj.destinationAirport = connecting_airport.iata;
                seed_data.push(flightObj);
            }
        }
        jsonfile.writeFileSync(path.join(__dirname, '../data/flights.json'), seed_data, {spaces:2});
        console.log('done seeding!');
    }

    static randomNumber(max, min, toFixed = false) {
        let new_number = Math.random() * (max-min+1)+min;
        return (toFixed) ? new_number.toFixed(2)/1 : Math.floor(new_number);
    }
}

module.exports = AirportInterface;