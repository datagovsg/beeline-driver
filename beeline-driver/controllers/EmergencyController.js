import _ from "lodash";
import confirmPromptTemplate from "../templates/confirm-prompt.html";
import loadingTemplate from "../templates/loading.html";
const VALID_PHONE_REGEX = /^[8-9]{1}[0-9]{7}$/;

export default[
  "$scope",
  "$ionicPopup",
  "DriverService",
  "$state",
  "TripService",
  "$rootScope",
  "VerifiedPromptService",
  "$ionicLoading",
  function(
    $scope,
    $ionicPopup,
    DriverService,
    $state,
    TripService,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading
  ){

    var tripData = DriverService.getDecodedToken();

    $scope.data = {};

    var confirmPrompt = function(options) {
      var promptScope = $rootScope.$new(true);
      promptScope.data = {
        toggle: false
      };
      _.defaultsDeep(options,{
        template: confirmPromptTemplate,
        title: "",
        subTitle: "",
        scope: promptScope,
        buttons: [
          { text: "Cancel"},
          {
            text: "OK",
            type: "button-royal",
            onTap: function(e) {
              if (promptScope.data.toggle){
                return true;
              }
              e.preventDefault();
            }
          }
        ]
      });
      return $ionicPopup.show(options);
    };

    var promptTelephoneNumber = function(title, subtitle){
      return VerifiedPromptService.verifiedPrompt({
        title: title,
        subTitle: subtitle,
        inputs: [
          {
            type: "number",
            name: "phone",
            pattern: VALID_PHONE_REGEX
          }
        ]
      });
    };

    $scope.showReplaceDriverPopup = async function() {
      try {
        var phoneResponse = await promptTelephoneNumber("Replacement Driver",
          "Please enter replacement driver 8 digits number");
        if (!phoneResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        var phoneNumber = phoneResponse.phone;
        $ionicLoading.hide();
        //Success! Show the confirmation popup.
        $scope.data.replaceDriverNumber = phoneNumber;
        await $ionicPopup.alert({
          title: "The trip info has been sent to +65"+ $scope.data.replaceDriverNumber+"<br>Driver Ops has been alerted!"
        });
        TripService.pingTimer = false;
        $state.go("app.jobEnded",{status: "tripReplaced", replacementPhoneNumber:phoneNumber});
      }
      catch(error){
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "There was an error submitting the replacement number. Please try again."+ error
        });
      }
    };


    // When button is clicked, the popup will be shown...
    $scope.showCancelTripPopup = async function() {
      try {
        var promptResponse = await confirmPrompt({
          title: "Are you sure?",
          subTitle: "Slide to cancel trip. This will notify the passsengers and ops."
        });
        if (!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        await TripService.cancelTrip(tripData.tripId);
        $ionicLoading.hide();
        await $ionicPopup.alert({
          title: "Trip is cancelled.<br>Passengers and Ops are alerted!"
        });
        TripService.pingTimer = false;
        $state.go("app.jobEnded",{status: "tripCancelled"});
      }
      catch(error){
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "There was an error cancelling trip. Please try again.",
          subTitle: error
        });
      }
    };


    $scope.showNotifyLatePopup = async function() {
      try {
        var promptResponse = await confirmPrompt({
          title: "Late?",
          subTitle: "More than 15 mins late. Notify your passengers that you \
           will be late."
        });
        if (!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        await TripService.notifyTripLate(tripData.tripId);
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Passengers Notified that you will be more than 15 mins late."
        });
      }
      catch(error){
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "There was an error notifying late. Please try again. ",
          subTitle: error
        });
      }
    };
  }];
