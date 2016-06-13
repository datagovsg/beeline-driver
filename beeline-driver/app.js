/* global angular, cordova, StatusBar */
import "babel-polyfill";
import CancelController from "./controllers/CancelController.js";
import LoginController from "./controllers/LoginController.js";
import RouteController from "./controllers/RouteController.js";
import SidebarController from "./controllers/SidebarController.js";
import StartController from "./controllers/StartController.js";
import BeelineService from "./services/BeelineService.js";
import TokenService from "./services/TokenService.js";
import DriverService from "./services/DriverService.js";
import TripService from "./services/TripService.js";
import PingService from "./services/PingService.js";
import VerifiedPromptService from "./services/VerifiedPromptService.js";
import loadingTemplate from "./templates/version-too-old.html";

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
  "ngCordova"
])
.controller("CancelController", CancelController)
.controller("LoginController", LoginController)
.controller("RouteController", RouteController)
.controller("SidebarController", SidebarController)
.controller("StartController", StartController)
.service("BeelineService",BeelineService)
.service("TokenService",TokenService)
.service("DriverService",DriverService)
.service("TripService",TripService)
.service("PingService",PingService)
.service("VerifiedPromptService",VerifiedPromptService)
.config(configureRoutes)
.run(function($ionicPlatform, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //version no in config.xml only readable from android and ios
    if (window.cordova) {
      cordova.getAppVersion(function(version) {
        appVersion = version;
      });
    }

    console.log(appVersion);
    localStorage["version"] = appVersion;
    // "0.0.1" becomes 0.1
    var versionNo = +(appVersion.replace(".", ""));
    console.log(versionNo);

    //enable overlay if verion too old
    //server API return least version to allow access
    // e.g. "0.0.2"
    if (versionNo <= 0.1){
      $ionicLoading.show({template: loadingTemplate});
    }
  });
});

//current is appVersion, least is returned from API
//if return true, ionicLoading is popped up to disallow interactivity
var checkVerison = function(current, least) {
  return (+(current.replace(".", "")) < +(least.replace(".", "")))
}
