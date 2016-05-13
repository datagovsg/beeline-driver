"use strict";
export default[
  "$scope",
  "$state",
  "DriverService",
  "TripService",
  "$stateParams",
  "TokenService",
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $stateParams,
    TokenService
  ){
    $scope.$on("$ionicView.afterEnter",()=>{
      $scope.stopId = +$stateParams.stopId;
      //Display Stops + Passenger Information
      TripService.getPassengersByStop(TokenService.get("tripId"))
      .then(function(response){
        $scope.passengersByStop = response;
        $scope.passengerList = $scope.passengersByStop[$scope.stopId];
        $scope.stopObject = TripService.boardStops
          .filter(stop=>stop.id === $scope.stopId)[0];
        $scope.stopDescription = $scope.stopObject.stop.description+", "
          +$scope.stopObject.stop.road;
      });
    });
  }];
