"use strict";
export default[
  "$scope",
  "DriverService",
  "$state",
  '$stateParams',
  "$ionicPopup",
  function(
    $scope,
    DriverService,
    $state,
    $stateParams,
    $ionicPopup
  ){
    $scope.data ={
      number: $stateParams.phoneNo || undefined,
      verification: undefined,
    }
    $scope.login = async function(){
      try{
        var no = $scope.data.number;
        await DriverService.sendTelephoneVerificationCode(no);
        $state.go("sms",{"phoneNo": no});
      }
      catch(error){
        //driver is not registered
        if (error.status==404){
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
        var no = $scope.data.number;
        var code = $scope.data.verification;
        console.log(no);
        console.log(code);
        self.driver = await DriverService.verifyTelephone(no, code);
        await DriverService.getVehicleInfo(true);
        $state.go("app.route");
      }
      catch(err){
        console.log(err);
      }
    }
  }];
