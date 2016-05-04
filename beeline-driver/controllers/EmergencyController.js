'use strict';
import verifiedPromptTemplate from '../templates/verified-prompt.html';
const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;

export default[
  '$scope',
  '$ionicPopup',
  'DriverService',
  '$state',
  'TripService',
  '$rootScope',
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    TripService,
    $rootScope
  ){

    var tripData = DriverService.getDecodedToken();

    $scope.data = {}

    //Phone Number submission
    $scope.validPhoneNumber = /^[8-9]{1}[0-9]{7}$/;


    // ////////////////////////////////////////////////////////////////////////////
    // UI methods
    // ////////////////////////////////////////////////////////////////////////////
    var verifiedPrompt = function(verify, options) {
      var promptScope = $rootScope.$new(true);
      promptScope.data = {};
      promptScope.data.phoneNumber = options.phoneNumber || false;
      promptScope.data.late = options.late || false;
      promptScope.data.cancelTrip = options.cancelTrip || false;
      return $ionicPopup.show({
        template: verifiedPromptTemplate,
        title: options.title,
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

    $scope.showReplaceDriverPopup = function() {
      return verifiedPrompt((s) => VALID_PHONE_REGEX.test(s),{
        title: 'Replacement Driver',
        subTitle: 'Please enter replacement driver 8 digits number',
        phoneNumber: true
      })
      .then(function(phoneNumber) {
        if (!phoneNumber) return;
        DriverService.assignReplacementDriver(tripData.tripId, phoneNumber)
        .then(function(response){
          //Success! Show the confirmation popup.
          $scope.data.replaceDriverNumber = phoneNumber;
          $ionicPopup.alert({
            template: 'The trip info has been sent to +65'+ $scope.data.replaceDriverNumber+'<br>Driver Ops has been alerted!'
          }).then(function(response){
            if(response){
              TripService.pingTimer = false;
              $state.go('app.jobEnded',{status: "tripReplaced", replacementPhoneNumber:phoneNumber});
            }
          })
        })
      })
      .catch(function(error){
        $ionicPopup.alert({
          title: 'There was an error submitting the replacement number. Please try again.',
          subTitle: error
        });
      });
    };


    // When button is clicked, the popup will be shown...
    $scope.showCancelTripPopup = function() {
      return verifiedPrompt((s) => {return (s == true)},{
        title: 'Are you sure?',
        subTitle: 'Slide to cancel trip. This will notify the \
        passsengers and ops.',
        cancelTrip: true
      })
      .then(async function(res) {
        if (!res) return;
        await TripService.cancelTrip(tripData.tripId);
        $ionicPopup.alert({
          template: 'Trip is cancelled.<br>Passengers and Ops are alerted!'
        }).then(function(response){
          if(response){
            TripService.pingTimer = false;
            $state.go('app.jobEnded',{status: "tripCancelled"});
          }
        })
       })
       .catch(function(error){
         $ionicPopup.alert({
           title: 'There was an error cancelling trip. Please try again.',
           subTitle: error
         });
       });
    };


    $scope.showNotifyLatePopup = function() {
      return verifiedPrompt((s) => {return (s == true)},{
        title: 'Late?',
        subTitle: 'More than 15 mins late. Notify your passengers that you \
        will be late.',
        late: true
      })
      .then(async function(res) {
        if (!res) return;
        await TripService.notifyTripLate(tripData.tripId);
        $ionicPopup.alert({
          template: 'Passengers Notified that you will be more than 15 mins late.'
        });
     })
     .catch(function(error){
       $ionicPopup.alert({
         title: 'There was an error notifying late. Please try again.',
         subTitle: error
       });
     });
    };
}];
