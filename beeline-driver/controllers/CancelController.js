import loadingTemplate from "../templates/loading.html";

export default[
  "$scope",
  "$stateParams",
  "TripService",
  "$ionicLoading",
  function(
    $scope,
    $stateParams,
    TripService,
    $ionicLoading
  ){
    $scope.job = {
      // date: new Date(),
      date: null,
      tripId: null,
      routeId: null,
    };

    $scope.$on("$ionicView.enter",async ()=> {
      $scope.job.tripId = $stateParams.tripId;
      $ionicLoading.show({template: loadingTemplate});
      var trip = await TripService.getTrip($scope.job.tripId);
      $ionicLoading.hide();
      $scope.$apply(()=>{
        $scope.job.date = trip.date;
        $scope.job.routeId = trip.routeId;
      })
    });
  }];
