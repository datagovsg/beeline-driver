'use strict';

export default[
    '$scope',
    '$stateParams',
    'DriverService',
    'TripService',
  function(
    $scope,
    $stateParams,
    DriverService,
    TripService
  ){
    $scope.job = {
      // date: new Date(),
      date: TripService.trip.date,
      status: '',
      tripId: null
    };
    $scope.$on('$ionicView.beforeEnter',()=>{
      $scope.job.status = parseInt($stateParams.status);
    });
    $scope.job.tripId = DriverService.getDecodedToken().tripId;

  }];
