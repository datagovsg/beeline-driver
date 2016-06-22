"use strict";
import loadingTemplate from "../templates/loading.html";

const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;

export default[
  "$scope",
  "DriverService",
  "$state",
  '$stateParams',
  "$ionicLoading",
  "VerifiedPromptService",
  function(
    $scope,
    DriverService,
    $state,
    $stateParams,
    $ionicLoading,
    VerifiedPromptService
  ){
    $scope.data = {
      phoneNo: $stateParams.phoneNo || undefined,
    }

    $scope.login = async function(){
      try {
        if(VALID_PHONE_REGEX.test($scope.data.phoneNo)){
          $ionicLoading.show({template: loadingTemplate});
          await DriverService.sendTelephoneVerificationCode($scope.data.phoneNo);
          $ionicLoading.hide();
          $state.go("sms",{"phoneNo": $scope.data.phoneNo});
        }
        else {
          await VerifiedPromptService.alert({
            title: "Your phone number is invalid.",
          });
          $scope.data.phoneNo = undefined;
          $scope.$apply();
        }
      }
      catch (error) {
        //driver is not registered
        if (error.status == 404) {
          $ionicLoading.hide();
          await VerifiedPromptService.alert({
            title: "Sorry. Your phone no. is not in the Beeline system. \
                    Please tell your bus company."
          });
          $scope.data.phoneNo = undefined;
          $scope.$apply();
        }
      }
    }

    $scope.$on('$ionicView.leave',() => {
      $scope.data.phoneNo = undefined;
      $scope.$apply();
    })
  }];
