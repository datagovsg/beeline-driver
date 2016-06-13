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
        $scope.data.tripId = await TripService.assignTrip($scope.data.routeId);
        $state.go("start",{"tripId": $scope.data.tripId});
      }
      catch(error) {
        console.log(error.stack);
        if (error.message=="tripCancelled") {
          var trip = TripService.getCacheTrip();
          $state.go("cancel",{tripId: trip.id})
        }
      }
    }
  }
];
