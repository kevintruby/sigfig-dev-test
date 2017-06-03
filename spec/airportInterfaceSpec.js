const jsonfile = require('jsonfile');
const path = require('path');
const AirportInterface = require('../services/AirportInterface');

describe("class AirportInterface", function () {

    describe("method allAirports()", function () {

        it("returns JSON", function () {
            let body = AirportInterface.allAirports();
            expect(typeof body).toBe('object');
        });

        it("has 'airports' property", function () {
            let body = AirportInterface.allAirports();
            expect(body.hasOwnProperty('airports')).toBeTruthy();
        });

        it("has contents in 'airports' property", function () {
            let body = AirportInterface.allAirports();
            expect(body.airports.length).toBeGreaterThan(0);
            expect(body.airports.length).toBe(141);
        });
    });

    describe("method connectingFlights()", function () {

        beforeEach(function () {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("returns empty array for zero parameters", function () {
            let body = AirportInterface.connectingFlights();
            expect(body).toEqual([]);
            body = AirportInterface.connectingFlights('', []);
            expect(body).toEqual([]);
        });

        it("returns three results for SFO airport via mocked flight data", function () {
            let mocked_data = jsonfile.readFileSync(path.join(__dirname, '../data/mockedFlights.json'));
            let body = AirportInterface.connectingFlights('SFO', mocked_data);
            expect(body.length).toBe(3);
        });
    });

    describe("method earliestItinerary()", function () {

        beforeEach(function () {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("returns empty array for zero parameters", function () {
            let body = AirportInterface.earliestItinerary();
            expect(body).toEqual([]);
            body = AirportInterface.earliestItinerary({});
            expect(body).toEqual([]);
        });

        /**
         * I had trouble building a viable seeder, ended up modifying the basic set of data provided in the dev test
         * definition; the original expected a single result with two results. I added a few more, and extended the
         * arrival time of the original expectation. The new path should involve SFO -> SEA -> EWR -> JFK -> IAD. This
         * path is picked because it still arrives sooner than the two-flight expectation after comparing all possible
         * hops. The seeder method has been updated to use a mocked set of flight data prior to running tests.
         */
        it("returns data for airport SFO -> IAD", function () {
            let body = AirportInterface.earliestItinerary({sourceAirport: 'SFO', destinationAirport: 'IAD'});
            expect(body.length).toBeGreaterThan(0);
            expect(body.length).toBe(4);
            let mockedResponse = jsonfile.readFileSync(path.join(__dirname, '../data/mockedItinerary.json'));
            expect(body).toEqual(mockedResponse);
        });
    });
});