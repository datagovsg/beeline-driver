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

  }];
