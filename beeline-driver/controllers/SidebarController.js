import _ from "lodash";
import confirmPromptTemplate from "../templates/confirm-prompt.html";
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
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading,
    TokenService
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
      console.log(vehicle);
      if (vehicle){
        $scope.data.vehicleNo = vehicle.vehicleNumber;
      }
    });

    $scope.$watch(() => DriverService.vehicle, (vehicle) => {
      $scope.data.vehicleNo = vehicle? vehicle.vehicleNumber : null;
    });

    var confirmPrompt = function(options) {
      var promptScope = $rootScope.$new(true);
      promptScope.data = {
        toggle: false
      };
      _.defaultsDeep(options,{
        template: confirmPromptTemplate,
        title: "",
        subTitle: "",
        scope: promptScope,
        buttons: [
          { text: "Cancel"},
          {
            text: "OK",
            type: "button-royal",
            onTap: function(e) {
              if (promptScope.data.toggle){
                return true;
              }
              e.preventDefault();
            }
          }
        ]
      });
      return $ionicPopup.show(options);
    };

    var promptVehicleNumber = function(title, subtitle){
      return VerifiedPromptService.verifiedPrompt({
        title: title,
        subTitle: subtitle,
        inputs: [
          {
            type: "string",
            name: "vehicleNumber",
          }
        ]
      });
    };

    $scope.updateVehicleNo = async function() {
      try {
        var response = await promptVehicleNumber("Your Vehicle No");
        if (response && response.vehicleNumber) {
          console.log(response.vehicleNumber);
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
        console.log(error.stack);
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
