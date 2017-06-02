let angular = require('angular');

angular
    .module('clientInterface', [])
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
                $scope.airports = rsp.data;
                $scope.isLoading = false;
            });
        };

        $scope.onSubmit = () => {
            $scope.isLoading = true;
            $scope.results = [];
            let params = {
                sourceAirport: $scope.origin,
                destinationAirport: $scope.destination
            };
            $http.post('/api/earliestItinerary', params).then((rsp) => {
                $scope.results = rsp.data;
                $scope.isLoading = false;
            });
        };
    });

