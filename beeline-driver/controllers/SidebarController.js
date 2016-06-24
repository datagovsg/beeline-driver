import _ from "lodash";
import loadingTemplate from "../templates/loading.html";
const VALID_CAR_PLATE_REGEX = /^[a-zA-Z0-9_]+$/;

export default[
  "$scope",
  "$ionicPopup",
  "DriverService",
  "$state",
  "$rootScope",
  "VerifiedPromptService",
  "$ionicLoading",
  "TokenService",
  "$translate",
  "$ionicHistory",
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading,
    TokenService,
    $translate,
    $ionicHistory
  ){
    $scope.data = {
      vehicleNo: null
    };

    $scope.$on('$ionicView.enter',async ()=> {
      if (window.localStorage["vehicleId"] !== undefined && window.localStorage["vehicleId"] != 0) {
        var vehicle = await DriverService.getVehicleInfo(false);
      }
      else {
        var vehicle = await DriverService.getVehicleInfo(true);
      }
      if (vehicle){
        $scope.data.vehicleNo = vehicle.vehicleNumber;
      }
    });

    $scope.$watch(() => DriverService.vehicle, (vehicle) => {
      $scope.data.vehicleNo = vehicle? vehicle.vehicleNumber : null;
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
          $state.go("app.route");
        }
      }
      catch(error) {
        console.error(error.stack);
      }
    }

    $scope.logout = async function() {
      var translations = await $translate(['LOGOUT', 'ARE_YOU_SURE_TO_LOG_OUT', 'CANCEL_BUTTON', 'OK_BUTTON']);
      var promptResponse = await $ionicPopup.confirm ({
        title: translations.LOGOUT,
        template: translations.ARE_YOU_SURE_TO_LOG_OUT,
        buttons: [
          { text: translations.CANCEL_BUTTON},
          {
            text: translations.OK_BUTTON,
            type: "button-royal",
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
      if (!promptResponse) return;
      TokenService.token = null;
      window.localStorage.removeItem('sessionToken');
      window.localStorage.removeItem('vehicleId');
      //logout has no back view to choose-route
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go("login");
    }

  }];
