'use strict';

angular.module('myApp.view2', ['ngRoute','myApp.passengerservice'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/PassengerList', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', function($scope, PassengerService) {
    //5 is tripid
    PassengerService.loadData(5)
    .then(function () {
        $scope.$apply(function () {
            $scope.passengersByStop = PassengerService.passengersByStop;

            $scope.stopbyid = _.keyBy(
                PassengerService.tripData.tripStops,
                x => x.id);
            console.log($scope.stopbyid);
        });
    });

    
});
