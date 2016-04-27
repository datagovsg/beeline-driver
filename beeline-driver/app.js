import AppLandingController from './controllers/AppLandingController.js';
import JobEmergencyController from './controllers/EmergencyController.js';
import JobAcceptController from './controllers/JobAcceptController.js';
import JobAcceptedController from './controllers/JobAcceptedController.js';
import JobStartedController from './controllers/JobStartedController.js';
import JobEndedController from './controllers/JobEndedController.js';
import DriverService from './services/DriverService.js';
import TripService from './services/TripService.js';
import PingService from './services/PingService.js';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('beeline-driver', [
  'ionic',
  'ngCordova',
  'uiGmapgoogle-maps'
])
.controller('AppLandingController', AppLandingController)
.controller('JobEmergencyController', JobEmergencyController)
.controller('JobAcceptController', JobAcceptController)
.controller('JobAcceptedController', JobAcceptedController)
.controller('JobStartedController', JobStartedController)
.controller('JobEndedController', JobEndedController)
.service('DriverService',DriverService)
.service('TripService',TripService)
.service('PingService',PingService)
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
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/emergency.html',
    controller: 'JobEmergencyController'
  })
  .state('app.landing', {
    url: '/landing',
    views: {
      'menuContent': {
        templateUrl: 'templates/landing.html',
        controller: 'AppLandingController'
      }
    }
  })
  .state('app.jobAccept', {
    url: '/accept',
    views: {
      'menuContent': {
        templateUrl: 'templates/accept.html',
        controller: 'JobAcceptController'
      }
    }
  })
  .state('app.jobAccepted', {
      url: '/jobAccepted',
      views: {
        'menuContent': {
          templateUrl: 'templates/job-accepted.html',
          controller: 'JobAcceptedController'
        }
      }
    })
  .state('app.jobStarted', {
    url: '/jobStarted',
    views: {
      'menuContent': {
        templateUrl: 'templates/job-started.html',
        controller: 'JobStartedController'
      }
    }
  })
  .state('app.jobEnded', {
    url: '/jobEnded/:status?replacePhoneNo',
    views: {
      'menuContent': {
        templateUrl: 'templates/job-ended.html',
        controller: 'JobEndedController'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/landing');
});
