let angular = require('angular');
let uiBootstrap = require('angular-ui-bootstrap');

angular
    .module('clientInterface', ['ui.bootstrap'])
    .controller('interfaceCtrl', ($scope, $http) => {
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

        // initialize typehead inputs via API results
        $scope.onInit = () => {
            $scope.isLoading = true;
            $http.get('/api/availableAirports').then((rsp) => {
                $scope.airports = rsp.data.airports;
                $scope.isLoading = false;
            }, (err) => {
                console.log(err);
                $scope.airportDataError = true;
                $scope.isLoading = false;
            });
        };

        $scope.onSubmit = () => {
            $scope.isEmptyItinerary = false;
            $scope.isLoading = true;
            $scope.results = [];

            // Allow standard input in case the typeahead didn't bind
            let origin = (angular.isObject($scope.origin)) ? $scope.origin.iata : $scope.origin.toUpperCase();
            let destination = (angular.isObject($scope.destination)) ? $scope.destination.iata : $scope.destination.toUpperCase();

            let params = {
                sourceAirport: origin,
                destinationAirport: destination
            };

            // @todo: this should probably come from a custom angular service, but I didn't have time to write one
            $http.post('/api/earliestItinerary', params).then((rsp) => {
                $scope.results = rsp.data;
                $scope.isEmptyItinerary = (!rsp.data.length);
                $scope.isLoading = false;
            }, (err) => {
                console.log(err);
                $scope.isLoading = false;
            });
        };
    });

