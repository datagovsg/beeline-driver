
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
      date: null,
      tripId: null,
      routeId: null,
      routeDescription: null,
    };

    $scope.$on("$ionicView.enter",async ()=>{
      $scope.job.routeId = $stateParams.routeId;
      $scope.job.tripId = $stateParams.tripId;
      $ionicLoading.show({template: loadingTemplate});
      var trip = await TripService.getTrip($scope.job.tripId);
      $ionicLoading.hide();
      $scope.$apply(()=>{
        $scope.job.date = trip.date;
        $scope.job.routeId = trip.routeId;
      })
      TripService.getRouteDescription($scope.job.routeId)
      .then((res) => {
        $scope.job.routeDescription = res;
      });
    });
  }];
