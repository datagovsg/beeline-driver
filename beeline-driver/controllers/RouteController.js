import _ from 'lodash';
import loadingTemplate from "../templates/loading.html";
//any length of non-negative number
const VALID_INTEGER_REGEX = /^[0-9]*$/;

export default [
  "$scope",
  "TripService",
  "$state",
  "$ionicLoading",
  "VerifiedPromptService",
  "$ionicHistory",
  function(
    $scope,
    TripService,
    $state,
    $ionicLoading,
    VerifiedPromptService,
    $ionicHistory
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
          //start has no back view to route selection
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go("start",{"routeId": $scope.data.routeId, "tripId": $scope.data.tripId});
        }
        else {
          await VerifiedPromptService.alert({
            title: "Your input is invalid."
          });
          $scope.data.routeId = undefined;
          $scope.$apply();
        }
      }
      catch(error) {
        if (error.status == 404) {
          $ionicLoading.hide();
          VerifiedPromptService.alert({
            title: "There is no such route."
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        else if (error.message=="noTrip") {
          $ionicLoading.hide();
          VerifiedPromptService.alert({
            title: "No such trip. Please check your route id."
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        else if (error.message && error.message.includes("tripCancelled")) {
          $ionicLoading.hide();
          $scope.data.tripId = error.message.substr(13).valueOf();
          $state.go("cancel",{routeId:$scope.data.routeId, tripId: $scope.data.tripId});
        }
        else {
          $ionicLoading.hide();
          VerifiedPromptService.alert({
            title: "Error",
            subTitle: `${error.status} - ${error.message}`
          }).then(function(response){
            $scope.data.routeId = undefined;
            $state.go("login");
          })
        }
      }
    }
  }
];
