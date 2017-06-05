describe('ngApp clientInterface', () => {
    let $controller, $httpBackend, $q, $scope, apiService, availableAirports, deferred;
    let mocked_airports = readJSON('data/mockedAirports.json');
    let mocked_itinerary = readJSON('data/mockedItinerary.json');

    beforeEach(module('clientInterface'));

    beforeEach(inject((_apiService_, _$httpBackend_, _$q_, $rootScope, _$controller_) => {
        apiService = _apiService_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $scope = $rootScope.$new();
        deferred = $q.defer();

        $controller = _$controller_;

        availableAirports = $httpBackend.whenGET('/api/availableAirports').respond(mocked_airports);
        $httpBackend.whenPOST('/api/earliestItinerary').respond((method, url, data, headers, params) => {
            try {
                data = JSON.parse(data);
            }
            catch(err) {
                return [ 500, [] ]
            }

            // assume only return valid mocked route for SFO -> IAD
            if(data.sourceAirport && data.destinationAirport && 'SFO' === data.sourceAirport && 'IAD' === data.destinationAirport) {
                return [ 200, mocked_itinerary ];
            }
            return [ 200, [] ];
        });
    }));

    describe('$scope.onInit()', () => {
        let controller;

        beforeEach(() => {
            controller = $controller('interfaceCtrl', { $scope, apiService });
        });

        it('should update the $scope.isLoading value during the ng-init process, reverting upon completion', () => {
            expect($scope.isLoading).toBe(false);

            // trigger init process
            $scope.onInit();
            expect($scope.isLoading).toBe(true);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.isLoading).toBe(false);
        });

        it('should retain the $scope.airportDataError value during the ng-init process', () => {
            expect($scope.airportDataError).toBe(false);

            // trigger init process
            $scope.onInit();

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.airportDataError).toBe(false);
        });

        it('should update the $scope.airportDataError value during the ng-init process upon server-side error', () => {
            expect($scope.airportDataError).toBe(false);

            // trigger init process
            $scope.onInit();

            availableAirports.respond(500, '');

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.airportDataError).toBe(true);
        });

        it('should update the $scope.isLoading value during the ng-init process, reverting upon completion with server-side error', () => {
            expect($scope.isLoading).toBe(false);

            // trigger init process
            $scope.onInit();
            expect($scope.isLoading).toBe(true);

            availableAirports.respond(500, '');

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.isLoading).toBe(false);
        });
    });

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

        it('should have a populated array for $scope.results if sourceAirport/destinationAirport parameters are valid simple values', () => {
            expect($scope.results).toEqual([]);

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

        it('should have a populated array for $scope.results if sourceAirport/destinationAirport parameters are valid airport objects returned by ui-typeahead', () => {
            expect($scope.results).toEqual([]);

            $scope.origin = mocked_airports.airports[0];        // SFO
            $scope.destination = mocked_airports.airports[1];   // IAD
            $scope.$apply();

            // trigger submit
            $scope.onSubmit();
            expect($scope.isLoading).toBe(true);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.results).toEqual(mocked_itinerary);
        });

        it('should set $scope.isEmptyItinerary value to true upon completion of form submission if invalid parameters', () => {
            expect($scope.isEmptyItinerary).toBe(false);

            // trigger submit
            $scope.onSubmit();
            expect($scope.isEmptyItinerary).toBe(false);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.isEmptyItinerary).toBe(true);
        });

        it('should set $scope.isEmptyItinerary value to true upon completion of form submission if no route found', () => {
            expect($scope.isEmptyItinerary).toBe(false);

            $scope.origin = 'IAD';
            $scope.destination = 'SFO';
            $scope.$apply();

            // trigger submit
            $scope.onSubmit();
            expect($scope.isEmptyItinerary).toBe(false);

            // flush the $http call handled by apiService
            $httpBackend.flush();

            expect($scope.isEmptyItinerary).toBe(true);
        });
    });
});
