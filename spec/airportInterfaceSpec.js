const jsonfile = require('jsonfile');
const path = require('path');
const AirportInterface = require('../services/AirportInterface');

describe("class AirportInterface", () => {

    describe("method allAirports()", () => {

        it("returns JSON", () => {
            let body = AirportInterface.allAirports();
            expect(typeof body).toBe('object');
        });

        it("has 'airports' property", () => {
            let body = AirportInterface.allAirports();
            expect(body.hasOwnProperty('airports')).toBeTruthy();
        });

        it("has contents in 'airports' property", () => {
            let body = AirportInterface.allAirports();
            expect(body.airports.length).toBeGreaterThan(0);
            expect(body.airports.length).toBe(141);
        });
    });

    describe("method connectingFlights()", () => {

        beforeEach(() => {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("returns empty array for zero parameters", () => {
            let body = AirportInterface.connectingFlights();
            expect(body).toEqual([]);
            body = AirportInterface.connectingFlights('', []);
            expect(body).toEqual([]);
        });

        it("returns three results for SFO airport via mocked flight data", () => {
            let mocked_data = jsonfile.readFileSync(path.join(__dirname, '../data/mockedFlights.json'));
            let body = AirportInterface.connectingFlights('SFO', mocked_data);
            expect(body.length).toBe(3);
        });
    });

    describe("method crawlConnections()", () => {

        beforeEach(() => {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("should return one discovered path, equal to the mocked response", () => {
            let mocked_data = jsonfile.readFileSync(path.join(__dirname, '../data/mockedFlights.json'));
            let mockedResponse = jsonfile.readFileSync(path.join(__dirname, '../data/mockedItinerary.json'));

            let body = AirportInterface.crawlConnections(mocked_data, [mockedResponse[0]], 'IAD');
            expect(body.length).toBe(1);
            expect(body[0].length).toBe(4);
            expect(body[0]).toEqual(mockedResponse);
        });
    });

    describe("method earliestItinerary()", () => {

        beforeEach(() => {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("returns empty array for zero parameters", () => {
            let body = AirportInterface.earliestItinerary();
            expect(body).toEqual([]);
            body = AirportInterface.earliestItinerary({});
            expect(body).toEqual([]);
        });

        /**
         * Because data is seeded, I ended up modifying the basic set of data provided in the dev test definition; the
         * original expected a single valid path result with two hops. I added a few more path options, and extended the
         * arrival time of the original expectation. The new path should involve SFO -> SEA -> EWR -> JFK -> IAD. This
         * path is picked because it still arrives sooner than the two-flight expectation after comparing all possible
         * paths. The seeder method inserts a mocked set of flight data prior to running tests.
         */
        it("returns data for airport SFO -> IAD", () => {
            let body = AirportInterface.earliestItinerary({sourceAirport: 'SFO', destinationAirport: 'IAD'});
            expect(body.length).toBeGreaterThan(0);
            expect(body.length).toBe(4);
            let mockedResponse = jsonfile.readFileSync(path.join(__dirname, '../data/mockedItinerary.json'));
            expect(body).toEqual(mockedResponse);
        });
    });
});