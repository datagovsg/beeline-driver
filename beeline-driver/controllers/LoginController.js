"use strict";
export default[
  "$scope",
  "DriverService",
  "$state",
  '$stateParams',
  function(
    $scope,
    DriverService,
    $state,
    $stateParams
  ){
    $scope.data ={
      number: $stateParams.phoneNo || undefined,
      verification: undefined
    }
    $scope.login = async function(){
      try{
        var no = $scope.data.number;
        console.log(no);
        await DriverService.sendTelephoneVerificationCode(no);
        $state.go("sms",{"phoneNo": no});
      }
      catch(err){
        console.log(err);
      }
    }
    $scope.verify = async function(){
      try{
        var no = $scope.data.number;
        var code = $scope.data.verification;
        console.log(no);
        console.log(code);
        await DriverService.verifyTelephone(no, code);
        $state.go("app.route");
      }
      catch(err){
        console.log(err);
      }
    }
  }];
