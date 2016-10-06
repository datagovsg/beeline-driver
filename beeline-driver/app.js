/* global angular, cordova, StatusBar */
import "babel-polyfill";
import CancelController from "./controllers/CancelController.js";
import LoginController from "./controllers/LoginController.js";
import SmsController from "./controllers/SmsController.js";
import RouteController from "./controllers/RouteController.js";
import SidebarController from "./controllers/SidebarController.js";
import StartController from "./controllers/StartController.js";
import BeelineService from "./services/BeelineService.js";
import TokenService from "./services/TokenService.js";
import DriverService from "./services/DriverService.js";
import TripService from "./services/TripService.js";
import PingService from "./services/PingService.js";
import VerifiedPromptService from "./services/VerifiedPromptService.js";
import VersionTooOldTemplate from "./templates/version-too-old.html";
import compareVersions from "compare-versions";
import "angular-translate";
import "angular-translate-loader-static-files";


// Configuration Imports
import configureRoutes from "./router.js";
// Ionic Starter App

// version for this distribution
var appVersion = "1.0.0";

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module("beeline-driver", [
  "ionic",
  "ngCordova",
  "pascalprecht.translate"
])
.controller("CancelController", CancelController)
.controller("LoginController", LoginController)
.controller("SmsController", SmsController)
.controller("RouteController", RouteController)
.controller("SidebarController", SidebarController)
.controller("StartController", StartController)
.service("BeelineService",BeelineService)
.service("TokenService",TokenService)
.service("DriverService",DriverService)
.service("TripService",TripService)
.service("PingService",PingService)
.service("SpeechService", require('./services/SpeechService').default)
.service("VerifiedPromptService",VerifiedPromptService)
.config(configureRoutes)
.config(function($translateProvider){
  $translateProvider.useStaticFilesLoader({
    prefix: './scripts/locales/',
    suffix: '.json'
  })
  .registerAvailableLanguageKeys(['en_US', 'zh_CN'], {
    'en_US' : 'en_US',
    'zh_CN' : 'zh_CN',
  })
  .preferredLanguage('en_US')
  .fallbackLanguage('en_US')
  .determinePreferredLanguage()
  .useSanitizeValueStrategy('escapeParameters');
})
.run(function($ionicPlatform, $ionicLoading, BeelineService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    //stop screen sleep
    if (window.plugins && window.plugins.insomnia){
      window.plugins.insomnia.keepAwake();
    }

    //version no in config.xml only readable from android and ios
    if (window.cordova) {
      cordova.getAppVersion(function(version) {
        appVersion = version;
      });
    }

    //check from server API if does not meet minimal version
    //ionicLoading pop up to stop user interactivity
    BeelineService.request({
      method: "GET",
      url: "/versionRequirements"
    })
    .then(function(response){
      return response.data["driverApp"]["minVersion"];
    })
    .then(function(response){
      if (compareVersions(appVersion, response)==-1){
        $ionicLoading.show({template: VersionTooOldTemplate});
      }
    })
    .catch(function(error) {
      console.error(error.stack);
    });

  });
});
