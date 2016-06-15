"use strict";
import loadingTemplate from "../templates/loading.html";

const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;
const VALID_VERIFICATION_REGEX = /^[0-9]{6}$/;

export default[
  "$scope",
  "DriverService",
  "$state",
  '$stateParams',
  "$ionicPopup",
  "$ionicLoading",
  function(
    $scope,
    DriverService,
    $state,
    $stateParams,
    $ionicPopup,
    $ionicLoading
  ){
    $scope.data ={
      phoneNo: $stateParams.phoneNo || undefined,
      verification: undefined,
    }
    $scope.login = async function(){
      try{
        if(VALID_PHONE_REGEX.test($scope.data.phoneNo)){
          $ionicLoading.show({template: loadingTemplate});
          await DriverService.sendTelephoneVerificationCode($scope.data.phoneNo);
          $ionicLoading.hide();
          $state.go("sms",{"phoneNo": $scope.data.phoneNo});
        }
        else {
          await $ionicPopup.alert({
            title: "Your phone number is invalid."
          });
          $scope.data.phoneNo = undefined;
          $scope.$apply();
        }
      }
      catch(error){
        //driver is not registered
        if (error.status==404){
          $ionicLoading.hide();
          console.log("not found");
          await $ionicPopup.alert({
            title: "Sorry. Your phone no. is not in the Beeline system. \
            Please tell your bus company."
          });
        }
      }
    }
    $scope.verify = async function(){
      try{
        var no = $scope.data.phoneNo;
        var code = $scope.data.verification;
        console.log(no);
        console.log(code);
        if(VALID_VERIFICATION_REGEX.test(code)){
          $ionicLoading.show({template: loadingTemplate});
          self.driver = await DriverService.verifyTelephone(no, code);
          await DriverService.getVehicleInfo(true);
          $ionicLoading.hide();
          $state.go("app.route");
        }
        else {
          await $ionicPopup.alert({
            title: "Your verification is invalid."
          });
          $scope.data.verification = undefined;
          $scope.$apply();
        }
      }
      catch(err){
        console.log(err);
      }
    }
  }];
