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
  "$translate",
  function(
    $scope,
    DriverService,
    $state,
    $stateParams,
    $ionicLoading,
    VerifiedPromptService,
    $translate
  ){
    $scope.data = {
      phoneNo: $stateParams.phoneNo || undefined,
    }


    $scope.switchLanguage = function(key) {
      $translate.use(key);
    };

    $scope.login = async function(){
      try {
        if($scope.data.phoneNo === '########' || VALID_PHONE_REGEX.test($scope.data.phoneNo)){
          try {
            $ionicLoading.show({template: loadingTemplate});
            await DriverService.sendTelephoneVerificationCode($scope.data.phoneNo);
          } catch (e) {
            throw e;
          } finally {
            $ionicLoading.hide();
          }
          $state.go("sms",{"phoneNo": $scope.data.phoneNo});
        }
        else {
          var translation = await $translate(['INPUT_INVALID']);
          await VerifiedPromptService.alert({
            title: translation.INPUT_INVALID
          });
          $scope.data.phoneNo = undefined;
          $scope.$apply();
        }
      }
      catch(error) {
        //driver is not registered
        if (error.status == 404) {
          var translation = await $translate(['PHONE_NOT_REGISTERED']);
          await VerifiedPromptService.alert({
            title: translation.PHONE_NOT_REGISTERED
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
