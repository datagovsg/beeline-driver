import _ from 'lodash';
const VALID_INTEGER_REGEX = /^[0-9]*[1-9][0-9]*$/;


export default [
  "$scope",
  "TripService",
  "$state",
  "$ionicPopup",
  function(
    $scope,
    TripService,
    $state,
    $ionicPopup
  ) {

    $scope.data = {
      routeId: undefined,
      tripId: undefined
    };

    $scope.start = async function() {
      try {
        if(VALID_INTEGER_REGEX.test($scope.data.routeId)){
          $scope.data.tripId = await TripService.assignTrip($scope.data.routeId);
          $state.go("start",{"tripId": $scope.data.tripId});
        }
        else {
          await $ionicPopup.alert({
            title: "Your input is invalid."
          });
          $scope.data.routeId = undefined;
          $scope.$apply();
        }
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
