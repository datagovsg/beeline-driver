import _ from 'lodash';
import loadingTemplate from "../templates/loading.html";
//any length of non-negative number
const VALID_INTEGER_REGEX = /^[0-9]*$/;

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
          $state.go("start",{"routeId": $scope.data.routeId, "tripId": $scope.data.tripId});
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
        if (error.status == 404) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: "There is no such route."
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        if (error.message=="noTrip") {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: "There is no trip today."
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        if (error.message.includes("tripCancelled")) {
          $ionicLoading.hide();
          $scope.data.tripId = error.message.substr(13).valueOf();
          $state.go("cancel",{routeId:$scope.data.routeId, tripId: $scope.data.tripId});
        }
      }
    }
  }
];
