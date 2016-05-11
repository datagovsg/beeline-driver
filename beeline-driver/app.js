/* global angular, cordova, StatusBar */
import "babel-polyfill";
import AppLandingController from "./controllers/AppLandingController.js";
import JobEmergencyController from "./controllers/EmergencyController.js";
import JobAcceptController from "./controllers/JobAcceptController.js";
import JobAcceptedController from "./controllers/JobAcceptedController.js";
import JobStartedController from "./controllers/JobStartedController.js";
import PassengerListController from "./controllers/PassengerListController.js";
import JobEndedController from "./controllers/JobEndedController.js";
import DriverService from "./services/DriverService.js";
import TripService from "./services/TripService.js";
import VerifiedPromptService from "./services/verifiedPromptService.js";

// Configuration Imports
import configureRoutes from "./router.js";
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module("beeline-driver", [
  "ionic",
  "ngCordova",
  "uiGmapgoogle-maps"
])
.controller("AppLandingController", AppLandingController)
.controller("JobEmergencyController", JobEmergencyController)
.controller("JobAcceptController", JobAcceptController)
.controller("JobAcceptedController", JobAcceptedController)
.controller("JobStartedController", JobStartedController)
.controller("PassengerListController", PassengerListController)
.controller("JobEndedController", JobEndedController)
.service("DriverService",DriverService)
.service("TripService",TripService)
.service("VerifiedPromptService",VerifiedPromptService)
.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}])
.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    //client: 'gme-infocommunications',
    key: "AIzaSyDC38zMc2TIj1-fvtLUdzNsgOQmTBb3N5M",
    libraries: "places"
  });
})
.config(configureRoutes)
.run(function($ionicPlatform) {
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
  });
});
