import _ from 'lodash';
import loadingTemplate from "../templates/loading.html";
//any length of non-negative number
const VALID_INTEGER_REGEX = /^[0-9]*[1-9][0-9]*$/;

export default [
  "$scope",
  "TripService",
  "$state",
  "$ionicPopup",
  "$ionicLoading",
  function(
    $scope,
    TripService,
    $state,
    $ionicPopup,
    $ionicLoading
  ) {

    $scope.data = {
      routeId: undefined,
      tripId: undefined
    };

    $scope.start = async function() {
      try {
        if(VALID_INTEGER_REGEX.test($scope.data.routeId)){
          $ionicLoading.show({template: loadingTemplate});
          $scope.data.tripId = await TripService.assignTrip($scope.data.routeId);
          $ionicLoading.hide();
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
        if (error.message=="noTrip") {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: "There is no trip today."
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        if (error.message=="tripCancelled") {
          $ionicLoading.hide();
          var trip = TripService.getCacheTrip();
          $state.go("cancel",{tripId: trip.id});
        }
      }
    }
  }
];
