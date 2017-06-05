const jsonfile = require('jsonfile');
const path = require('path');
const _ = require('lodash');

/**
 * Airports JSON data courtesy of https://github.com/jbrooksuk/JSON-Airports
 */

class AirportInterface {
    constructor() {}


    /**
     * @TODO: PROVIDE DESCRIPTION
     *
     * @returns {{airports: Array}}
     */

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


    /**
     * @TODO: PROVIDE DESCRIPTION
     *
     * @param airport {string}
     * @param flight_data {Array}
     * @returns {Array}
     */

    static connectingFlights(airport = '', flight_data = []) {
        if(_.isEmpty(airport) || _.isEmpty(flight_data))
            return [];
        let connecting_flights = _.reduce(flight_data, (results, flight) => {
            if(airport === flight.sourceAirport)
                results.push(flight);
            return results;
        }, []);
        connecting_flights.sort((a, b) => {
            let temp_a = new Date(a.departureTime);
            let temp_b = new Date(b.departureTime);
            if(temp_a < temp_b) return -1;
            if(temp_a > temp_b) return 1;
            return 0;
        });
        return connecting_flights;
    }


    /**
     * @TODO: PROVIDE DESCRIPTION
     *
     * @param flight_data {Array}
     * @param progress {Array}
     * @param destination {string}
     * @returns {false|Array}
     */

    static crawlConnections(flight_data = [], progress = [], destination = '') {
        if(_.isEmpty(flight_data) || _.isEmpty(progress) || _.isEmpty(destination))
            return false;
        let prev_flight = _.last(progress);
        let next_options = AirportInterface.connectingFlights(prev_flight.destinationAirport, flight_data);

        if(_.isEmpty(next_options))
            return false;

        let discovered_paths = [];

        for(let i in next_options) {
            let flight = next_options[i];
            let arrival_datetime = new Date(prev_flight.arrivalTime);
            let minimum_departure_datetime = new Date(arrival_datetime);

            // satisfies requirement that connecting flights allow at least 20 minutes between arrival and departure
            minimum_departure_datetime.setMinutes(arrival_datetime.getMinutes() + 20);
            let departure_datetime = new Date(flight.departureTime);

            let progress_clone = _.map(progress, _.clone);

            if(departure_datetime >= minimum_departure_datetime) {
                progress_clone.push(flight);
                if(destination === flight.destinationAirport){
                    discovered_paths.push(progress_clone);
                    continue;
                }
                let path_continue = AirportInterface.crawlConnections(flight_data, progress_clone, destination);
                if(false !== path_continue)
                    _.forEach(path_continue, (val) => discovered_paths.push(val));
            }
        }
        return (discovered_paths.length) ? discovered_paths : false;
    }


    /**
     * Searches available flight data for the earliest arrival at destination from a given source, by any possible path
     *
     * @param params {object} -- expects keys 'sourceAirport' and 'destinationAirport'
     * @returns {Array}
     */

    static earliestItinerary(params = {}) {
        if(_.isEmpty(params) || !_.has(params, 'sourceAirport') || !_.has(params, 'destinationAirport'))
            return [];
        let available_flights = jsonfile.readFileSync(path.join(__dirname, '../data/flights.json'));
        let initial_connections = AirportInterface.connectingFlights(params.sourceAirport, available_flights);
        let full_paths = [];
        let potential_paths = [];
        let itinerary = [];

        for(let i in initial_connections) {
            let connection = initial_connections[i];
            if(params.destinationAirport === connection.destinationAirport) {
                full_paths.push( [ connection ] );
                continue;
            }
            potential_paths.push( [ connection ] );
            let path_options = AirportInterface.crawlConnections(available_flights, _.last(potential_paths), params.destinationAirport);
            if(false !== path_options){
                _.forEach(path_options, (val) => full_paths.push(val));
            }
        }

        if(full_paths.length) {
            if(1 === full_paths.length)
                itinerary = full_paths[0];
            else {
                full_paths.sort((a, b) => {
                    let temp_a = new Date(_.last(a).arrivalTime);
                    let temp_b = new Date(_.last(b).arrivalTime);
                    if(temp_a < temp_b) return -1;
                    if(temp_a > temp_b) return 1;
                    return 0;
                });
                itinerary = full_paths[0];
            }
        }

        return itinerary;
    }


    /**
     * Populate JSON file with randomized data
     *
     * For randomized connections, attempts to calculate departure time based on distance and average cruising velocity.
     * If either airport lacks coordinate data, the arrival time is randomized.
     *
     * Void method
     *
     * @param use_mocked {boolean} -- optional: whether or not to write mocked data to file for unit tests
     */

    static seedFlights(use_mocked = false) {
        if(use_mocked) {
            let mocked_data = jsonfile.readFileSync(path.join(__dirname, '../data/mockedFlights.json'));
            jsonfile.writeFileSync(path.join(__dirname, '../data/flights.json'), mocked_data, {spaces:2});
            return;
        }
        console.log('seeding flight data...');
        let available_airports = AirportInterface.allAirports();
        available_airports = available_airports.airports;
        let flights_per_airport = 10;
        let existing_flight_numbers = [];
        let seed_data = [];

        for (let index in available_airports) {
            let airport = available_airports[index];
            let initial_timestamp = Date.now();
            for(let i = 0; i < flights_per_airport; i++) {
                let flight_number = 0;
                // this do/while loop guarantees a unique flight number for each seeded entry
                do {
                    flight_number = AirportInterface.randomNumber(9999, 1);
                } while(-1 === !existing_flight_numbers.indexOf(flight_number));
                existing_flight_numbers.push(flight_number);

                let departureTime = new Date(initial_timestamp + ((AirportInterface.randomNumber(10,2, true))*3600000));

                let flightObj = {
                    "flightNumber": flight_number,
                    "sourceAirport": `${airport.iata}`,
                    "destinationAirport": "",
                    "departureTime": `${departureTime.toISOString()}`,
                    "arrivalTime": ''
                };

                let connecting_airport_index = AirportInterface.randomNumber(available_airports.length-1, 0);
                if(connecting_airport_index === airport) {
                    if(connecting_airport_index === available_airports.length-1)
                        connecting_airport_index -= 1;
                    else connecting_airport_index += 1;
                }
                let connecting_airport = available_airports[connecting_airport_index];

                // randomized arrival time, in case we can't calculate an approximate time based on distance/velocity
                let arrivalTime = new Date(departureTime.valueOf() + ((AirportInterface.randomNumber(10,2, true))*3600000));
                if(_.has(airport, 'lat') && _.has(airport, 'lon')
                   && _.has(connecting_airport, 'lat') && _.has(connecting_airport, 'lon')) {
                    let distance = AirportInterface.distance(airport.lat, airport.lon, connecting_airport.lat, connecting_airport.lon);
                    // Wikipedia gives range of 546–575 mph
                    let avg_velocity = AirportInterface.randomNumber(575, 546, true);
                    // duration in hours
                    let flight_duration = distance / avg_velocity;
                    arrivalTime = new Date(departureTime.valueOf() + (flight_duration * 3600000));
                }
                initial_timestamp += (AirportInterface.randomNumber(360, 1, true) * 60000);
                flightObj.destinationAirport = connecting_airport.iata;
                flightObj.arrivalTime = `${arrivalTime.toISOString()}`;
                seed_data.push(flightObj);
            }
        }
        jsonfile.writeFileSync(path.join(__dirname, '../data/flights.json'), seed_data, {spaces:2});
        console.log('done seeding!');
    }


    /**
     * Produces random number between desired values
     *
     * @param max {number} -- maximum number desired by generator
     * @param min {number} -- minimum number desired by generator
     * @param toFixed {boolean} -- optional: whether to return integer or round to 2 decimal places
     * @returns {number|float}
     */

    static randomNumber(max, min, toFixed = false) {
        let new_number = Math.random() * (max-min+1)+min;
        return (toFixed) ? new_number.toFixed(2)/1 : Math.floor(new_number);
    }


    /**
     * Calculates distance between two points.
     *
     * Borrowed and slightly modified from http://www.geodatasource.com/developers/javascript
     *
     * @param lat1 {float} -- source latitude
     * @param lon1 {float} -- source longitude
     * @param lat2 {float} -- destination latitude
     * @param lon2 {float} -- destination longitude
     * @param unit {string} -- optional: 'K' for kilometers, 'N' for nautical miles, 'M' for miles (default)
     * @returns {number|float}
     */

    static distance(lat1, lon1, lat2, lon2, unit = 'M') {
        let radlat1 = Math.PI * lat1/180;
        let radlat2 = Math.PI * lat2/180;
        let theta = lon1-lon2;
        let radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.;
        if ('K' === unit) { dist = dist * 1.609344 }
        if ('N' === unit) { dist = dist * 0.8684 }
        return dist
    }
}

module.exports = AirportInterface;