let angular = require('angular');

angular
    .module('clientInterface', [])
    .controller('interfaceCtrl', ($scope, $http) => {
        // input models
        $scope.origin = '';
        $scope.destination = '';

        // loading status
        $scope.isLoading = false;

        // results model
        $scope.results = [];

        $scope.onSubmit = () => {
            $scope.isLoading = true;
            $scope.results = [];
            $http.get('/api').then((rsp) => {
                console.log(rsp.data);
                $scope.results = rsp.data;
                $scope.isLoading = false;
            });
        }
    });

