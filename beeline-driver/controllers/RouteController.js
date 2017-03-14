import _ from 'lodash';
import loadingTemplate from "../templates/loading.html";
//any length of non-negative number
const VALID_INTEGER_REGEX = /^[0-9]+$/;
const VALID_CAR_PLATE_REGEX = /^[a-zA-Z0-9_]+$/;

export default [
  "$scope",
  "TripService",
  "$state",
  "$ionicLoading",
  "VerifiedPromptService",
  "$ionicHistory",
  "$translate",
  'DriverService',
  function(
    $scope,
    TripService,
    $state,
    $ionicLoading,
    VerifiedPromptService,
    $ionicHistory,
    $translate,
    DriverService
  ) {

    $scope.data = {
      routeId: null,
      tripId: null,
      phoneNo: null,
      vehicleNo: null
    };

    $scope.switchLanguage = function(key) {
      $translate.use(key);
    };

    $scope.$on('$ionicView.enter',async () => {
      if (!await DriverService.verifySession()) {
        //logout has no back view to choose-route
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("login");
      } else {
        if (window.localStorage["vehicleId"] !== undefined && window.localStorage["vehicleId"] != 0) {
          var vehicle = await DriverService.getVehicleInfo(false);
        }
        else {
          var vehicle = await DriverService.getVehicleInfo(true);
        }
        if (vehicle){
          $scope.data.vehicleNo = vehicle.vehicleNumber.toUpperCase();
        }
        $scope.data.phoneNo = window.localStorage["phoneNo"] || null;
        $scope.$digest();
      }
    });

    var promptVehicleNumber = function(title, subtitle) {
      return VerifiedPromptService.verifiedPrompt({
        title: title,
        subTitle: subtitle,
        inputs: [
          {
            type: "text",
            name: "vehicleNumber",
            pattern: VALID_CAR_PLATE_REGEX
          }
        ]
      });
    };

    $scope.updateVehicleNo = async function() {
      try {
        var translations = await $translate(['YOUR_VEHICLE_NO','VEHICLE_IS_UPDATED_TO']);
        var response = await promptVehicleNumber(translations.YOUR_VEHICLE_NO);
        if (response && response.vehicleNumber) {
          try {
            $ionicLoading.show({template: loadingTemplate});
            await DriverService.updateVehicleNo(response.vehicleNumber);
          } catch (e) {
            throw e;
          } finally {
            $ionicLoading.hide();
          }
          await VerifiedPromptService.alert({
            title: translations.VEHICLE_IS_UPDATED_TO + response.vehicleNumber
          });
        }
      }
      catch(error) {
        console.error(error.stack);
      }
    }

    $scope.$watch(() => DriverService.vehicle, (vehicle) => {
      $scope.data.vehicleNo = vehicle? vehicle.vehicleNumber.toUpperCase() : null;
    });


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
          $scope.data.routeId = null;
          $scope.$apply();
        }
      }
      catch(error) {
        if (error.status == 404) {
          var translation = await $translate(['NO_ROUTE_ERROR']);
          VerifiedPromptService.alert({
            title: translation.NO_ROUTE_ERROR
          }).then(function(response){
            $scope.data.routeId = null;
          })
        }
        else if (error.message=="noTrip") {
          var translation = await $translate(['NO_TRIP_ERROR']);
          VerifiedPromptService.alert({
            title: translation.NO_TRIP_ERROR
          }).then(function(response){
            $scope.data.routeId = null;
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
            $scope.data.routeId = null;
          })
        }
      }
    }
  }
];
