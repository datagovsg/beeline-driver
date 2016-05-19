import _ from "lodash";
import verifiedPromptTemplate from "../templates/verified-prompt.html";

export default[
  "$ionicPopup",
  "$rootScope",
  function(
    $ionicPopup,
    $rootScope
  ){
    this.verifiedPrompt = function(options) {
      var promptScope = $rootScope.$new(true);
      promptScope.form ={
        verifiedPromptForm : {}
      };
      promptScope.data = {};
      promptScope.data.inputs = options.inputs || [];
      _.defaultsDeep(options,{
        template: verifiedPromptTemplate,
        title: "",
        subTitle: "",
        scope: promptScope,
        buttons: [
          { text: "Cancel"},
          {
            text: "OK",
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
  }
];
