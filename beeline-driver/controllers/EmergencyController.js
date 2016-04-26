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
    $scope.eightDigitNumber = /^[0-9]{8}$/;

    $scope.showReplaceDriverPopup = function() {

     // Custom popup
      var replaceDriverPopup = $ionicPopup.show({
        title: 'Driver Replacement',
        cssClass: 'driver-replace',
        templateUrl: '/templates/emerg-replace-driver.html',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Send Job</b>',
            onTap: function(e) {
              var phoneNum = document.getElementById('replace-phone').value;

              //check if phone number is valid or not
              if ($scope.eightDigitNumber.test(phoneNum)) {
                //Regex check OK - proceed with submission

                DriverService.assignReplacementDriver(tripData.tripId, phoneNum).then(function(response){
                  //Success! Show the confirmation popup.

                  $ionicPopup.alert({
                    template: 'The Trip info has been sent to +65'+ $scope.data.replaceDriverNo+'<br>Driver Ops has been alerted!'
                  }).then(function(response){
                    if(response){
                      TripService.pingTimer = false;
                      $state.go("app.jobEnded",{status: 1});
                    }
                  })
                },function(error){
                  alert('There was an error submitting the replacement number. Please try again.')
                });
              }
              else { //not true - display error message
                var replaceErr = document.getElementById('replace-error');

                angular.element(replaceErr).removeClass('ng-hide');
              }
            }
          }
        ]
       });
    };


    // When button is clicked, the popup will be shown...
    $scope.showCancelTripPopup = function() {
     // Custom popup
      var cancelTripPopup = $ionicPopup.show({
        title: 'Are you sure?',
        cssClass: 'driver-cancel',
        templateUrl: '/templates/emerg-job-cancel.html',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Confirm</b>',
            // type: 'button-positive',
            onTap: function(e) {
             if (!$scope.data.cancelTrip || !$scope.data.cancelTripConfirm) {
               //don't allow the user to close unless he enters wifi password
               e.preventDefault();
             } else {
               return $scope.data.cancelTripConfirm;
             }
            }
          }
        ]
       });
       cancelTripPopup.then(function(res) {
          if(res) {
             //TODO: send cancel job infor to server

             $ionicPopup.alert({
               template: 'Trip is cancelled.<br>Passengers and Ops are alerted!'
             }).then(function(response){
               if(response){
                 TripService.pingTimer = false;
                 $state.go("app.jobEnded",{status: 2});
               }
             })

          } else {
             console.log('Not sure!');
          }
       });
    };


    $scope.showNotifyLatePopup = function() {
     // Custom popup
      var tripLatePopup = $ionicPopup.show({
        title: 'Late?',
        cssClass: 'driver-late',
        templateUrl: '/templates/emerg-job-late.html',
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
       tripLatePopup.then(function(res) {
          if(res) {
             //TODO: send job late infor to server

             $ionicPopup.alert({
               template: 'Passengers Notified that you will be more than 15 mins late.'
             });
          } else {
             console.log('Not sure!');
          }
       });
    };


}];
