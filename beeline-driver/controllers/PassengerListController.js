'use strict';
import _ from 'lodash';
export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  '$stateParams',
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $stateParams
  ){
    $scope.$on('$ionicView.afterEnter',()=>{
      $scope.stopId = +$stateParams.stopId;
      //Display Stops + Passenger Information
      TripService.getPassengersByStop(DriverService.getDecodedToken().tripId)
      .then(function(response){
        $scope.passengersByStop = response;
        $scope.passengerList = $scope.passengersByStop[$scope.stopId];
        $scope.stopObject = TripService.boardStops
                      .filter(stop=>stop.id === $scope.stopId)[0];
        console.log($scope.stopObject);
        $scope.stopDescription = $scope.stopObject.stop.description+', '
          +$scope.stopObject.stop.road;
      })
    });
}];
