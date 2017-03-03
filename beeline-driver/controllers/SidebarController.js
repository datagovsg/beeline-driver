import _ from "lodash";
import loadingTemplate from "../templates/loading.html";


export default[
  "$scope",
  "$ionicPopup",
  "$state",
  "$rootScope",
  "VerifiedPromptService",
  "$ionicLoading",
  "TokenService",
  "$translate",
  "$ionicHistory",
  function(
    $scope,
    $ionicPopup,
    $state,
    $rootScope,
    VerifiedPromptService,
    $ionicLoading,
    TokenService,
    $translate,
    $ionicHistory
  ){

    $scope.logout = async function() {
      var translations = await $translate(['LOGOUT', 'ARE_YOU_SURE_TO_LOG_OUT', 'CANCEL_BUTTON', 'OK_BUTTON']);
      var promptResponse = await $ionicPopup.confirm ({
        title: translations.LOGOUT,
        template: translations.ARE_YOU_SURE_TO_LOG_OUT,
        buttons: [
          { text: translations.CANCEL_BUTTON},
          {
            text: translations.OK_BUTTON,
            type: "button-royal",
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
      if (!promptResponse) return;
      TokenService.logout();
      //logout has no back view to choose-route
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go("login");
    }

  }];
