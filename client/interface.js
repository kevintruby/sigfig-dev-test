let angular = require('angular');
let angularAnimate = require('angular-animate');
let angularTouch = require('angular-touch');
let uiBootstrap = require('angular-ui-bootstrap');

angular
    .module('clientInterface', ['ui.bootstrap'])
    .controller('interfaceCtrl', ($scope, $http) => {
        // input models
        $scope.origin = '';
        $scope.destination = '';
        $scope.airports = [];

        // loading status
        $scope.isLoading = false;

        // results model
        $scope.results = [];

        $scope.onInit = () => {
            $scope.isLoading = true;
            $http.get('/api/availableAirports').then((rsp) => {
                $scope.airports = rsp.data.airports;
                console.log($scope.airports.length);
                $scope.isLoading = false;
            });
        };

        $scope.onSubmit = () => {
            $scope.isLoading = true;
            $scope.results = [];
            let params = {
                sourceAirport: $scope.origin.iata,
                destinationAirport: $scope.destination.iata
            };
            $http.post('/api/earliestItinerary', params).then((rsp) => {
                $scope.results = rsp.data;
                $scope.isLoading = false;
            });
        };
    });

