import _ from "lodash";
import loadingTemplate from "../templates/loading.html";
const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;

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
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading,
    TokenService,
    $translate
  ){
    $scope.data = {
      vehicleNo: null
    };

    $scope.$on('$ionicView.enter',async ()=>{
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


    var promptVehicleNumber = function(title, subtitle){
      return VerifiedPromptService.verifiedPrompt({
        title: title,
        subTitle: subtitle,
        inputs: [
          {
            type: "text",
            name: "vehicleNumber",
          }
        ]
      });
    };

    $scope.updateVehicleNo = async function() {
      try {
        var transition = await $translate(['YOUR_VEHICLE_NO']);
        var response = await promptVehicleNumber(transition.YOUR_VEHICLE_NO);
        if (response && response.vehicleNumber) {
          $ionicLoading.show({template: loadingTemplate});
          await DriverService.updateVehicleNo(response.vehicleNumber);
          $ionicLoading.hide();
          await VerifiedPromptService.alert({
            title: "Vehicle is updated to " + response.vehicleNumber
          });
          $state.go("app.route");
        }
      }
      catch(error) {
        console.error(error.stack);
      }

    }

    $scope.logout = async function() {
      var promptResponse = await $ionicPopup.confirm ({
        title: "Log Out",
        template: "Are you sure you want to log out?",
        okType: "button-royal"
      });
      if (!promptResponse) return;
      TokenService.token = null;
      //FIXME need to do this?
      window.localStorage.removeItem('sessionToken');
      window.localStorage.removeItem('vehicleId');
      $state.go("login");
    }


  }];
