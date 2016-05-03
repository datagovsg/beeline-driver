import updatePhoneTemplate from '../templates/popup-update-phone.html';

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
      telephoneNumber: '',
    }

    DriverService.getVehicleInfo().then(function(){
      //find out the driver's vehicle number
      $scope.vehicle.id = DriverService.vehicle[0].id;
      $scope.vehicle.vehicleNumber = DriverService.vehicle[0].vehicleNumber;
    });

    DriverService.getDriverInfo().then(function(){
      $scope.driver.name = DriverService.driver.name;
      $scope.driver.telephoneNumber = DriverService.driver.telephone;
    })

    $scope.popupTelephone = function(initial) {
      var scope = $scope.$new();
      scope.data = {
        newTelephone: initial.substr(3)
      }
      var myPopup = $ionicPopup.show({
         template: updatePhoneTemplate,
         title: 'Update',
         defaultValue: initial,
         scope: scope,
         buttons: [
            { text: 'Cancel' },
            {
              text: '<b>Save</b>',
              onTap: function(e) {
                if (!scope.data.newTelephone) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                } else {
                  return scope.data.newTelephone;
                }
              }
            }
          ]
       });
       var validPhoneNumber = /^[8-9]{1}[0-9]{7}$/;
       myPopup.then(async function(res) {
         try{
           if (res){
               if (validPhoneNumber.test(res)==false){
                 $ionicPopup.alert({
                   template: 'Wrong phone number. Please try again.'
                 })
               } else {
                 await DriverService.updateDriverPhone(res);
                 $scope.$apply(() => {
                   $scope.driver.telephoneNumber = "+65"+res;
                 })
               }
           }
         } catch (error) {
           $ionicPopup.alert({
             template: 'Error updating phone number, please try again.'
           })
           console.log(error);
         }
       });
    }

    $scope.popup = function(modelName, initial){
      var myPopup = $ionicPopup.prompt({
         template: `Enter your ${modelName}`,
         title: 'Update',
         defaultText: initial,
       });
       myPopup.then(async function(res) {
         try{
           if (res){
             if (modelName == "driver name"){
               await DriverService.updateDriverName(res);
               $scope.$apply(() => {
                 $scope.driver.name = res;
               });
             }else if (modelName == "vehicle number"){
               await DriverService.updateVehicleNo(res);
               $scope.$apply(()=>{
                 $scope.vehicle.vehicleNumber = res;
               });
             }
           }
         } catch (error) {
           $ionicPopup.alert({
             template: 'Error processing '+modelName+', please try again.'
           })
           console.log(error);
         }

       });
    }
  }];
