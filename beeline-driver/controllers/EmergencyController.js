'use strict';

export default[
  '$scope',
  '$ionicPopup',
  'DriverService',
  '$state',
  'TripService',
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    TripService
  ){

    var tripData = DriverService.getDecodedToken();

    $scope.data = {}

    //Phone Number submission
    $scope.eightDigitNumber = /^[8-9]{1}[0-9]{7}$/;

    $scope.showReplaceDriverPopup = function() {

      async function promptForDriver() {
        var template = 'Enter replacement driver number';

        while (true) {
          var result = await $ionicPopup.prompt({
            title: 'Replacement Driver',
            template: template,
          })
          if (result){
            if (result && $scope.eightDigitNumber.test(result)) {
              break;
            }
            else {
              template = 'Invalid number! Enter replacement driver number'
            }
          }else {
             break;
          }
        }
        return result;
      }

      promptForDriver().then(function(phoneNum) {
        if (phoneNum) {
          DriverService.assignReplacementDriver(tripData.tripId, phoneNum).then(function(response){
            //Success! Show the confirmation popup.
            $scope.data.replaceDriverNo = phoneNum;
            $ionicPopup.alert({
              template: 'The Trip info has been sent to +65'+ $scope.data.replaceDriverNo+'<br>Driver Ops has been alerted!'
            }).then(function(response){
              if(response){
                TripService.pingTimer = false;
                $state.go("app.jobEnded",{status: 1, replacePhoneNo:phoneNum});
              }
            })
          },function(error){
            console.log(error);
            alert('There was an error submitting the replacement number. Please try again.')
          });
        }
      });
    };


    // When button is clicked, the popup will be shown...
    $scope.showCancelTripPopup = function() {
     // Custom popup
      var template = '<ion-checkbox ng-model="data.cancelTrip">\
                        Yes, I want to cancel trip.\
                      </ion-checkbox>\
                      <p>Slide to cancel trip. This will notify the passengers and ops.</p>\
                      <ion-toggle ng-model="data.cancelTripConfirm" toggle-class="toggle-assertive">\
                        Slide to confirm\
                      </ion-toggle>';
      var cancelTripPopup = $ionicPopup.show({
        title: 'Are you sure?',
        // cssClass: 'driver-cancel',
        template: template,
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Confirm</b>',
            // type: 'button-positive',
            onTap: function(e) {
             if (!$scope.data.cancelTrip || !$scope.data.cancelTripConfirm) {
               //don't allow the user to close unless he on toggle
               e.preventDefault();
             } else {
               return $scope.data.cancelTripConfirm;
             }
            }
          }
        ]
       });
       cancelTripPopup.then(async function(res) {
          if(res) {
            try {
              //TODO: send cancel job infor to server
              await TripService.cancelTrip(tripData.tripId);
              $ionicPopup.alert({
                template: 'Trip is cancelled.<br>Passengers and Ops are alerted!'
              }).then(function(response){
                if(response){
                  TripService.pingTimer = false;
                  $state.go("app.jobEnded",{status: 2});
                }
              })
            } catch(error) {
              console.log(error);
            }
          } else {
             console.log('Not sure!');
          }
       });
    };


    $scope.showNotifyLatePopup = function() {
     // Custom popup
     var template = '<p>More than 15 mins late. Notify your passengers that you will be late.</p>\
                      <ion-toggle ng-model="data.tripLate" toggle-class="toggle-assertive">\
                        Slide to confirm\
                      </ion-toggle>';
      var tripLatePopup = $ionicPopup.show({
        title: 'Late?',
        // cssClass: 'driver-late',
        template: template,
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Confirm</b>',
            // type: 'button-positive',
            onTap: function(e) {
             if (!$scope.data.tripLate) {
               //don't allow the user to close unless he enters wifi password
               e.preventDefault();
             } else {
               return $scope.data.tripLate;
             }
            }
          }
        ]
       });
       tripLatePopup.then(async function(res) {
          if(res) {
            try {
              //TODO: send job late infor to server
              await TripService.notifyTripLate(tripData.tripId);
              $ionicPopup.alert({
                template: 'Passengers Notified that you will be more than 15 mins late.'
              });
            } catch(error) {
              console.log(error);
            }
          } else {
             console.log('Not sure!');
          }
       });
    };


}];
