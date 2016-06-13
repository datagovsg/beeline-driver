import _ from 'lodash';

export default [
  "$scope",
  "TripService",
  "$state",
  function(
    $scope,
    TripService,
    $state
  ) {

    $scope.data = {
      routeId: undefined,
      tripId: undefined
    };

    $scope.start = async function() {
      try {
        // await TripService.getTripFromRouteId($scope.data.routeId);
        console.log($scope.data.routeId);
        $scope.data.tripId = await TripService.assignTrip($scope.data.routeId);
        $state.go("start",{"tripId": $scope.data.tripId});
      }
      catch(error) {
        console.log(error.stack);
      }
    }
  }
];
