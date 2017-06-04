describe('interfaceCtrl', function () {
    beforeEach(module('clientInterface'));

    let $controller;

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('$scope.onInit()', function () {
        it('calls API for airport data', function () {
            let $scope = {};
            let controller = $controller('interfaceCtrl', { $scope });
            $scope.onInit();
            expect($scope.isLoading).toBeTruthy();
        });
    });
});