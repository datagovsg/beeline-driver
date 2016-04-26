'use strict';

export default[
    '$scope',
    '$stateParams',
    'DriverService',
  function(
    $scope,
    $stateParams,
    DriverService
  ){
    $scope.job = {
      date: new Date(),
      status: '',
      tripId: null
    };
    $scope.$on('$ionicView.beforeEnter',()=>{
      $scope.job.status = parseInt($stateParams.status);
    });
    $scope.job.tripId = DriverService.getDecodedToken().tripId;

  }];
