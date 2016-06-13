"use strict";

export default[
  "$scope",
  "$stateParams",
  "TripService",
  function(
    $scope,
    $stateParams,
    TripService
  ){
    $scope.job = {
      // date: new Date(),
      date: null,
      tripId: null,
      routeId: null,
    };

    $scope.$on("$ionicView.afterEnter",async ()=>{
      $scope.job.tripId = $stateParams.tripId;
      await TripService.cancelTrip($scope.job.tripId);
      var trip = await TripService.getTrip($scope.job.tripId);
      $scope.job.date = trip.date;
      $scope.job.routeId = trip.routeId;
      console.log($scope.job.date);
    });
  }];
