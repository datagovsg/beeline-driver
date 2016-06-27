
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
      try {
        $ionicLoading.show({template: loadingTemplate});
        $scope.job.routeDescription = await TripService.getRouteDescription($scope.job.routeId);
        var trip = await TripService.getTrip($scope.job.tripId);
      } catch (e) {
        console.error(e);
      } finally {
        $ionicLoading.hide();
      }

      $scope.$apply(()=>{
        $scope.job.date = trip.date;
      });
    });
  }];
