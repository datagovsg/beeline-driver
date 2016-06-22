import _ from "lodash";
import verifiedPromptTemplate from "../templates/verified-prompt.html";

export default[
  "$ionicPopup",
  "$rootScope",
  "$translate",
  function(
    $ionicPopup,
    $rootScope,
    $translate
  ){
    this.verifiedPrompt = async function(options) {
      var promptScope = $rootScope.$new(true);
      promptScope.form ={
        verifiedPromptForm : {}
      };
      promptScope.data = {};
      promptScope.data.inputs = options.inputs || [];
      var translations = await $translate(['CANCEL_BUTTON', 'OK_BUTTON']);
      _.defaultsDeep(options,{
        template: verifiedPromptTemplate,
        title: "",
        subTitle: "",
        scope: promptScope,
        buttons: [
          { text: translations.CANCEL_BUTTON},
          {
            text: translations.OK_BUTTON,
            type: "button-royal",
            onTap: function(e) {
              if (promptScope.form.verifiedPromptForm.$valid) {
                return promptScope.data;
              }
              e.preventDefault();
            }
          }
        ]
      });
      return $ionicPopup.show(options);
    };

    this.alert = function(options){
      _.defaultsDeep(options,{
        title: "",
        subTitle: "",
        okType: "button-royal",
      });
      return $ionicPopup.alert(options);
    }
  }
];
