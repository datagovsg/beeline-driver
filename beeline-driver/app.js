/* global angular, cordova, StatusBar */
import "babel-polyfill";
import CancelController from "./controllers/CancelController.js";
import DriverController from "./controllers/DriverController.js";
import LoginController from "./controllers/LoginController.js";
import RouteController from "./controllers/RouteController.js";
import SidebarController from "./controllers/SidebarController.js";
import PassengerListController from "./controllers/PassengerListController.js";
import StartController from "./controllers/StartController.js";
import DriverService from "./services/DriverService.js";
import TripService from "./services/TripService.js";
import PingService from "./services/PingService.js";
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
  "ngCordova"
])
.controller("CancelController", CancelController)
.controller("DriverController", DriverController)
.controller("LoginController", LoginController)
.controller("RouteController", RouteController)
.controller("SidebarController", SidebarController)
.controller("PassengerListController", PassengerListController)
.controller("StartController", StartController)
.service("DriverService",DriverService)
.service("TripService",TripService)
.service("VerifiedPromptService",VerifiedPromptService)
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
