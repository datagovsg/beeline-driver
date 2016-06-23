"use strict";
import loadingTemplate from "../templates/loading.html";

const VALID_VERIFICATION_REGEX = /^[0-9]{6}$/;

export default[
  "$scope",
  "DriverService",
  "$state",
  '$stateParams',
  "$ionicLoading",
  "VerifiedPromptService",
  "$ionicHistory",
  "$translate",
  function(
    $scope,
    DriverService,
    $state,
    $stateParams,
    $ionicLoading,
    VerifiedPromptService,
    $ionicHistory,
    $translate
  ){
    $scope.data = {
      phoneNo: $stateParams.phoneNo || undefined,
      verification: undefined,
    }

    $scope.verify = async function() {
      try{
        var no = $scope.data.phoneNo;
        var code = $scope.data.verification;
        if(VALID_VERIFICATION_REGEX.test(code)){
          $ionicLoading.show({template: loadingTemplate});
          await DriverService.verifyTelephone(no, code);
          await DriverService.getVehicleInfo(true);
          $ionicLoading.hide();
          //route has no back view to sms verification
          $ionicHistory.nextViewOptions({
            disableBack: true
          })
          $state.go("app.route");
        }
        else {
          var translation = await $translate(['INPUT_INVALID']);
          await VerifiedPromptService.alert({
            title: translation.INPUT_INVALID
          });
          $scope.data.verification = undefined;
          $scope.$apply();
        }
      }
      catch(error){
        console.log(error.stack);
        if (error.status == 401){
          var translation = await $translate(['VERIFICATION_NOT_MATCH']);
          $ionicLoading.hide();
          await VerifiedPromptService.alert({
            title: translation.VERIFICATION_NOT_MATCH
          });
          $scope.data.verification = undefined;
          $scope.$apply();
        }
        $ionicLoading.hide();
      }
    }

    $scope.$on('$ionicView.leave',()=> {
      $scope.data.phoneNo = undefined;
      $scope.data.verification = undefined;
      $scope.$apply();
    })
  }];
