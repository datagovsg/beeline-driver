import updatePhoneTemplate from '../templates/popup-update-phone.html';
import verifiedPromptTemplate from '../templates/verified-prompt.html';
const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;
const VALID_STRING = /.*\S.*/;

export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  '$ionicPopup',
  '$rootScope',
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $ionicPopup,
    $rootScope
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

    // ////////////////////////////////////////////////////////////////////////////
    // UI methods
    // ////////////////////////////////////////////////////////////////////////////
    var verifiedPrompt = function(verify, options) {
      var promptScope = $rootScope.$new(true);
      promptScope.data = {};
      promptScope.data.text = true;
      promptScope.data.placeholder = options.placeholder|| '';
      return $ionicPopup.show({
        template: verifiedPromptTemplate,
        title: options.title || 'Update',
        subTitle: options.subTitle,
        scope: promptScope,
        buttons: [
          { text: 'Cancel',
            onTap: function(e){
              return undefined;
            }
          },
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function(e) {
              if (verify(promptScope.data.input)) {
                return promptScope.data.input
              }
              promptScope.data.error = true;
              e.preventDefault();
            }
          }
        ]
      });
    };

    $scope.popupTelephone = function(initial) {
      return verifiedPrompt((s) => VALID_PHONE_REGEX.test(s),{
        subTitle: 'Enter your 8 digit telephone number',
        placeholder: initial.slice(3)
      })
      .then(async function(res) {
        if(!res) return;
        await DriverService.updateDriverPhone(res);
        $scope.$apply(() => {
         $scope.driver.telephoneNumber = "+65"+res;
        })
       })
       .catch(function(error){
         $ionicPopup.alert({
           title: 'There was an error updating telephone number. Please try again.',
           subTitle: error
         });
       });
    }

    $scope.popup = function(modelName, initial){
      return verifiedPrompt((s) => VALID_STRING.test(s),{
        subTitle: 'Enter your '+modelName,
        placeholder: initial
      })
     .then(async function(res) {
       if(!res) return;
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
    })
    .catch(function(error){
      $ionicPopup.alert({
        title: 'There was an error updating '+modelName+'. Please try again.',
        subTitle: error
      });
    });
  };
}];
