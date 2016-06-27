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
  "$translate",
  function(
    $scope,
    TripService,
    $state,
    $ionicLoading,
    VerifiedPromptService,
    $ionicHistory,
    $translate
  ) {

    $scope.data = {
      routeId: undefined,
      tripId: undefined
    };

    $scope.switchLanguage = function(key) {
      $translate.use(key);
    };

    $scope.start = async function() {
      try {
        if(VALID_INTEGER_REGEX.test($scope.data.routeId)) {
          try {
            $ionicLoading.show({template: loadingTemplate});
            $scope.data.tripId = await TripService.assignTrip($scope.data.routeId);
          } catch (e) {
            throw e;
          } finally {
            $ionicLoading.hide();
          }
          //start has no back view to route selection
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go("start",{"routeId": $scope.data.routeId, "tripId": $scope.data.tripId});
        }
        else {
          var translation = await $translate(['INPUT_INVALID']);
          await VerifiedPromptService.alert({
            title: translation.INPUT_INVALID
          });
          $scope.data.routeId = undefined;
          $scope.$apply();
        }
      }
      catch(error) {
        if (error.status == 404) {
          var translation = await $translate(['NO_ROUTE_ERROR']);
          VerifiedPromptService.alert({
            title: translation.NO_ROUTE_ERROR
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        else if (error.message=="noTrip") {
          var translation = await $translate(['NO_TRIP_ERROR']);
          VerifiedPromptService.alert({
            title: translation.NO_TRIP_ERROR
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
        else if (error.message && error.message.includes("tripCancelled")) {
          $scope.data.tripId = error.message.substr(13).valueOf();
          //cancel has no back view to route selection
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go("cancel",{routeId:$scope.data.routeId, tripId: $scope.data.tripId});
        }
        else {
          VerifiedPromptService.alert({
            title: "Error",
            subTitle: `${error.status} - ${error.message}`
          }).then(function(response){
            $scope.data.routeId = undefined;
          })
        }
      }
    }
  }
];
