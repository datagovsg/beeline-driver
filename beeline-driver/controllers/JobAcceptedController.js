import loadingTemplate from "../templates/loading.html";
const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;

export default[
  "$scope",
  "$state",
  "DriverService",
  "TripService",
  "$ionicPopup",
  "$rootScope",
  "VerifiedPromptService",
  "$ionicLoading",
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $ionicPopup,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading
  ){

    $scope.vehicle = {
      id: "",
      vehicleNumber: ""
    };

    $scope.driver = {
      name: "",
      telephoneNumber: ""
    };

    DriverService.getVehicleInfo().then(function(){
      //find out the driver's vehicle number
      $scope.vehicle.id = DriverService.vehicle[0].id;
      $scope.vehicle.vehicleNumber = DriverService.vehicle[0].vehicleNumber;
    });

    DriverService.getDriverInfo().then(function(){
      $scope.driver.name = DriverService.driver.name;
      $scope.driver.telephoneNumber = DriverService.driver.telephone;
    });

    $scope.popupTelephone = async function(initial) {
      try {
        var promptResponse = await VerifiedPromptService.verifiedPrompt({
          title: "Update Telephone Number",
          subTitle: "Enter your 8 digit telephone number",
          inputs: [
            {
              type: "number",
              name: "phone",
              pattern: VALID_PHONE_REGEX,
              inputPlaceHolder: initial.slice(3)
            }
          ]
        });
        if(!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        await DriverService.updateDriverPhone(promptResponse.phone);
        $ionicLoading.hide();
        $scope.driver.telephoneNumber = "+65"+promptResponse.phone;
        await $ionicPopup.alert({
          title: "You have updated telephone number to "+ $scope.driver.telephoneNumber
        });
      }
      catch(error){
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "There was an error updating telephone number. Please try again.",
          subTitle: error
        });
      }
    };

    $scope.popup = async function(modelName, initial){
      try {
        var promptResponse = await VerifiedPromptService.verifiedPrompt({
          title: "Update "+modelName,
          subTitle: "Enter your "+modelName,
          inputs: [
            {
              type: "text",
              name: modelName,
              inputPlaceHolder: initial
            }
          ]
        });
        if(!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        if (modelName === "driver name"){
          await DriverService.updateDriverName(promptResponse[modelName]);
          $scope.driver.name = promptResponse[modelName];
        }else if (modelName === "vehicle number"){
          await DriverService.updateVehicleNo(promptResponse[modelName]);
          $scope.vehicle.vehicleNumber = promptResponse[modelName];
        }
        $ionicLoading.hide();
        await $ionicPopup.alert({
          title: "You have updated "+ modelName +" to "+ promptResponse[modelName]
        });
      }
      catch(error){
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "There was an error updating "+modelName+". Please try again.",
          subTitle: error
        });
      }
    };
  }];
