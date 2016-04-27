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
      $scope.stopId = parseInt($stateParams.stopId);
      var tripData = DriverService.getDecodedToken();
      //Display Stops + Passenger Information
      TripService.getPassengersByStop(tripData.tripId)
      .then(function(){
        $scope.passengersByStop = TripService.passengersByStop;
        $scope.passengerList = $scope.passengersByStop[$scope.stopId];
      })
    });
}];
