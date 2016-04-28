'use strict';

export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  '$ionicPopup',
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $ionicPopup
  ){

    $scope.vehicle = {
      id: '',
      vehicleNumber: '',
    };

    $scope.driver = {
      name: '',
      telephoneNo: '',
    }

    var tripData = DriverService.getDecodedToken();

    if (typeof(tripData) != 'undefined') {
      DriverService.getVehicleInfo().then(function(){
        //find out the driver's vehicle number
        $scope.vehicle.id = DriverService.vehicle[0].id;
        $scope.vehicle.vehicleNumber = DriverService.vehicle[0].vehicleNumber;
      });
    }

    DriverService.getDriverInfo().then(function(){
      $scope.driver.name = DriverService.driver.name;
      $scope.driver.telephoneNo = DriverService.driver.telephone;
    })

    $scope.popup = function(modelName){
      $scope.data = {};
      $scope.data[modelName] = null;
      var myPopup = $ionicPopup.show({
         template: '<input ng-model="data.modelName">',
         title: 'Update',
         subTitle: 'Enter your '+ modelName,
         scope: $scope,
         buttons: [
           { text: 'Cancel' },
           {
             text: '<b>Save</b>',
             onTap: function(e) {
               if (!$scope.data.modelName) {
                 //don't allow the user to close unless he enters wifi password
                 e.preventDefault();
               } else {
                 return $scope.data.modelName;
               }
             }
           }
         ]
       });
       $scope.eightDigitNumber = /^[8-9]{1}[0-9]{7}$/;
       myPopup.then(async function(res) {
         try{
           if (res){
             if (modelName == "name"){
               await DriverService.updateDriverName(res);
               $scope.driver.name = res;
             }else if (modelName == "vehicle"){
               await DriverService.updateVehicleNo(res);
               $scope.vehicle.vehicleNumber = res;
             }else if (modelName == 'phoneNo'){
               if ($scope.eightDigitNumber.test(res)==false){
                 $ionicPopup.alert({
                   template: 'Wrong phone no. Please try again.'
                 })
               } else {
                 await DriverService.updateDriverPhone(res);
                 $scope.driver.telephoneNo = res;
               }
             }
           } else {
              console.log('Not sure!');
           }
         } catch (error) {
           $ionicPopup.alert({
             template: 'There is error, please try again.'
           })
           console.log(error);
         }

       });
    }
  }];
