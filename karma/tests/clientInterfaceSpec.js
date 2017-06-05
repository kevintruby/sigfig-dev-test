describe('ngApp clientInterface', () => {
    let apiService, $httpBackend, $q, earliestItinerary, $scope, $controller, deferred;
    let mocked_itinerary = readJSON('data/mockedItinerary.json');

    beforeEach(module('clientInterface'));

    beforeEach(inject((_apiService_, _$httpBackend_, _$q_, $rootScope, _$controller_) => {
        apiService = _apiService_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $scope = $rootScope.$new();
        deferred = $q.defer();

        $controller = _$controller_;

        earliestItinerary = $httpBackend.whenPOST('/api/earliestItinerary').respond((method, url, data, headers, params) => {
            try {
                data = JSON.parse(data);
            }
            catch(err) {
                return [ 500, [] ]
            }

            if(data.sourceAirport && data.destinationAirport) {
                return [ 200, mocked_itinerary ];
            }
            return [ 200, [] ];
        });
    }));

    describe('$scope.onSubmit()', () => {
        let controller;

        beforeEach(() => {
            controller = $controller('interfaceCtrl', { $scope, apiService });
        });

        it('should update the $scope.isLoading value during form submission, reverting upon completion', () => {
            expect($scope.isLoading).toBe(false);

            // trigger submit
            $scope.onSubmit();
            expect($scope.isLoading).toBe(true);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.isLoading).toBe(false);
        });

        it('should retain empty array for $scope.results if either sourceAirport/destinationAirport parameters are empty', () => {
            expect($scope.results).toEqual([]);

            // trigger submit
            $scope.onSubmit();

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.results).toEqual([]);

            // validate just the sourceAirport param via $scope.origin
            $scope.origin = 'SEA';
            $scope.$apply();

            // trigger submit
            $scope.onSubmit();

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.results).toEqual([]);

            // validate just the destinationAirport param via $scope.destination
            $scope.origin = '';
            $scope.destination = 'SEA';
            $scope.$apply();

            // trigger submit
            $scope.onSubmit();

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.results).toEqual([]);
        });

        it('should have a populated array for $scope.results if sourceAirport/destinationAirport parameters are valid', () => {
            expect($scope.results).toEqual([]);

            // set two valid basic parameter -- a secondary test will assert typeahead airport objects
            $scope.origin = 'SFO';
            $scope.destination = 'IAD';
            $scope.$apply();

            // trigger submit
            $scope.onSubmit();
            expect($scope.isLoading).toBe(true);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.results).toEqual(mocked_itinerary);
        });
    });
});
