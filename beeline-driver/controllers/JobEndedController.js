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
      date: undefined,
      status: '',
      tripId: null
    };

    $scope.$on('$ionicView.beforeEnter',()=>{
      $scope.job.tripId = DriverService.getDecodedToken().tripId;
      TripService.getTrip($scope.job.tripId).then(function(){
        $scope.job.date = TripService.trip.date;
      })
    });
    $scope.$on('$ionicView.afterEnter',()=>{
      $scope.job.status = parseInt($stateParams.status);
    })
}];
