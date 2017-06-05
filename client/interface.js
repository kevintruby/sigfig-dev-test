let angular = require('angular');
require('angular-ui-bootstrap');

angular
    .module('clientInterface', ['ui.bootstrap'])
    .controller('interfaceCtrl', ($scope, apiService) => {
        // input models
        $scope.origin = '';
        $scope.destination = '';
        $scope.airports = [];

        // loading status
        $scope.isEmptyItinerary = false;
        $scope.isLoading = false;
        $scope.airportDataError = false;

        // results model
        $scope.results = [];

        // initialize typeahead inputs via API results
        $scope.onInit = () => {
            $scope.isLoading = true;
            apiService.availableAirports().then((data) => {
                $scope.airports = data.airports;
            }, (err) => {
                $scope.airportDataError = true;
            }).catch(() => {}).finally(() => { $scope.isLoading = false; });
        };

        $scope.onSubmit = () => {
            $scope.isEmptyItinerary = false;
            $scope.isLoading = true;
            $scope.results = [];

            // Allow standard input in case the typeahead didn't bind
            let params = {
                sourceAirport: (angular.isObject($scope.origin)) ? $scope.origin.iata : $scope.origin.toUpperCase(),
                destinationAirport: (angular.isObject($scope.destination)) ? $scope.destination.iata : $scope.destination.toUpperCase()
            };

            apiService.earliestItinerary(params).then((data) => {
                $scope.results = data;
                $scope.isEmptyItinerary = (!data.length);
            }).catch(() => {}).finally(() => { $scope.isLoading = false; });
        };
    }).service('apiService', function ($http, $q) {
        let base_url = '/api';

        this.availableAirports = () => {
            let deferred = $q.defer();
            $http.get(`${base_url}/availableAirports`).then((rsp) => {
                deferred.resolve(rsp.data);
            }, (err) => {
                console.log(err);
                deferred.reject(err);
            });
            return deferred.promise;
        };

        this.earliestItinerary = (params) => {
            let deferred = $q.defer();
            $http.post(`${base_url}/earliestItinerary`, params).then((rsp) => {
                deferred.resolve(rsp.data);
            }, (err) => {
                console.log(err);
                deferred.reject(err);
            });
            return deferred.promise;
        };
    });

