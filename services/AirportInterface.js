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

    static crawlConnections(flight_data = [], progress = [], destination = '') {
        if(_.isEmpty(flight_data) || _.isEmpty(progress) || _.isEmpty(destination))
            return false;
        let prev_flight = _.last(progress);
        let next_options = AirportInterface.connectingFlights(prev_flight.destinationAirport, flight_data);

        if(_.isEmpty(next_options))
            return false;

        for(let i in next_options) {
            let flight = next_options[i];
            let arrival_datetime = new Date(prev_flight.arrivalTime);
            let minimum_departure_datetime = new Date(arrival_datetime);
            minimum_departure_datetime.setMinutes(arrival_datetime.getMinutes() + 20);
            let departure_datetime = new Date(flight.departureTime);

            if(departure_datetime >= minimum_departure_datetime) {
                progress.push(flight);
                if(destination === flight.destinationAirport){
                    return progress;
                }
                let progress_clone = _.map(progress, _.clone);
                return AirportInterface.crawlConnections(flight_data, progress_clone, destination);
            }

            return false;
        }
    }

    static earliestItinerary(params = {}) {
        if(_.isEmpty(params))
            return [];
        let available_flights = jsonfile.readFileSync(path.join(__dirname, '../data/flights.json'));
        let initial_connections = AirportInterface.connectingFlights(params.sourceAirport, available_flights);
        let full_paths = [];
        let potential_paths = [];
        let itinerary = [];

        for(let i in initial_connections) {
            potential_paths.push( [ initial_connections[i] ] );
            let path_option = AirportInterface.crawlConnections(available_flights, _.last(potential_paths), params.destinationAirport);
            if(false !== path_option){
                full_paths.push(path_option);
            }
        }

        if(full_paths.length) {
            if(1 === full_paths.length)
                itinerary = full_paths[0];
            else {
                let earliest_arrival = null;
                let index = 0;
                for(let path in full_paths) {
                    let arrival = new Date(_.last(full_paths[path]).arrivalTime);
                    if(null === earliest_arrival) {
                        earliest_arrival = arrival;
                        index = path;
                    }
                    else if(arrival < earliest_arrival) {
                            earliest_arrival = arrival;
                            index = path;
                    }
                }
                itinerary = full_paths[index];
            }
        }

        return itinerary;
    }

    static seedFlights() {
        let available_airports = AirportInterface.allAirports();
        available_airports = available_airports.airports;
        let flights_per_airport = 15;
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
                let arrivalTime = new Date(departureTime.valueOf() + ((AirportInterface.randomNumber(10,2, true))*3600000));
                initial_timestamp = arrivalTime.valueOf();

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