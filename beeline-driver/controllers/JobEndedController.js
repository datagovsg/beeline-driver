"use strict";

export default[
  "$scope",
  "$stateParams",
  "DriverService",
  "TripService",
  "TokenService",
  function(
    $scope,
    $stateParams,
    DriverService,
    TripService,
    TokenService
  ){
    $scope.job = {
      // date: new Date(),
      date: undefined,
      status: undefined,
      tripId: null,
      replacementPhoneNumber: undefined
    };

    $scope.$on("$ionicView.beforeEnter",()=>{
      $scope.job.tripId = TokenService.get("tripId");
      TripService.getTrip($scope.job.tripId).then(function(){
        $scope.job.date = TripService.trip.date;
      });
    });
    $scope.$on("$ionicView.afterEnter",()=>{
      $scope.job.status = $stateParams.status;
      $scope.job.replacementPhoneNumber = +$stateParams.replacementPhoneNumber;
    });
  }];
