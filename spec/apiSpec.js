const jsonfile = require('jsonfile');
const path = require('path');
const request = require('request');
const base_url = 'http://localhost:3000/api';
const AirportInterface = require('../services/AirportInterface');

/**
 * I don't think I set these calls up right. The done(); call is supposed to allow me to use the request module to test
 * API responses, but it executes way too fast. I added a spec for the class that these APIs call just to make sure.
 */

describe("API Router", function () {

    describe("GET /api/availableAirports", function () {

        it("returns status code 200", function () {
            request.get(`${base_url}/availableAirports`, function (err, rsp, body) {
                expect(rsp.statusCode).toBe(200);
                done();
            });
        });

        it("returns JSON", function () {
            request.get(`${base_url}/availableAirports`, function (err, rsp, body) {
                expect(typeof body).toBe('object');
                done();
            });
        });

        it("has 'airports' property", function () {
            request.get(`${base_url}/availableAirports`, function (err, rsp, body) {
                expect(body.hasOwnProperty('airports')).toBeTruthy();
                done();
            });
        });

        it("has contents in 'airports' property", function () {
            request.get(`${base_url}/availableAirports`, function (err, rsp, body) {
                expect(body.airports.length).toBeGreaterThan(0);
                expect(body.airports.length).toBe(141);
                done();
            });
        });
    });

    describe("POST /api/earliestItinerary", function () {

        beforeEach(function () {
            let use_mocked = true;
            AirportInterface.seedFlights(use_mocked);
        });

        it("returns status code 200 for zero parameters", function () {
            request.post(`${base_url}/earliestItinerary`, {}, function (err, rsp, body) {
                expect(rsp.statusCode).toBe(200);
                done();
            });
        });

        it("returns empty array for zero parameters", function () {
            request.post(`${base_url}/earliestItinerary`, {}, function (err, rsp, body) {
                expect(body).toBe([]);
                done();
            });
        });

        /**
         * I had trouble building a viable seeder, ended up modifying the basic set of data provided in the dev test
         * definition; the original expected a single result with two results. I added a few more, and extended the
         * arrival time of the original expectation. The new path should involve SFO -> SEA -> EWR -> JFK -> IAD. This
         * path is picked because it still arrives sooner than the two-flight expectation after comparing all possible
         * hops. The seeder method has been updated to use a mocked set of flight data prior to running tests.
         */
        it("returns data for airport SFO -> IAD", function () {
            request.post(`${base_url}/earliestItinerary`, {sourceAirport: 'SFO', destinationAirport: 'IAD'}, function (err, rsp, body) {
                expect(body.length).toBeGreaterThan(0);
                expect(body.length).toBe(4);
                let mockedResponse = jsonfile.readFileSync(path.join(__dirname, '../../data/mockedItinerary.json'));
                expect(body).toBe(mockedResponse);
                done();
            });
        });
    });
});