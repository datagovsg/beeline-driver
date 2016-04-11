// Declare app level module which depends on views, and components
import JobAcceptController from './controllers/JobAcceptController.js';
import JobAcceptedController from './controllers/JobAcceptedController.js';
import JobStartedController from './controllers/JobStartedController.js';
import UpdateBusController from './controllers/UpdateBusController.js';
import EmergencyController from './controllers/EmergencyController.js';
import ReplaceDriverController from './controllers/ReplaceDriverController.js';
import TitleHeader from './directives/TitleHeader/TitleHeader.js';

angular.module('myApp', [
  'ui.router',
  'uiGmapgoogle-maps'
])
.controller('IndexController', function(){})
.controller('JobAcceptController', JobAcceptController)
.controller('JobAcceptedController', JobAcceptedController)
.controller('JobStartedController', JobStartedController)
.controller('UpdateBusController', UpdateBusController)
.controller('EmergencyController', EmergencyController)
.controller('ReplaceDriverController', ReplaceDriverController)
.directive('titleHeader', TitleHeader)
.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDC38zMc2TIj1-fvtLUdzNsgOQmTBb3N5M',
    libraries: 'places'
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  	.state('index', {
  		abstract: true,
  		views: {
  			'@': {
  				template: '<div ui-view="sidemenu"></div><div id="contentview" ui-view="content"></div>',
  				controller: 'IndexController'
  			},
  			'content@index': { template: '<div id="content" ui-view=""></div>'},
  			'sidemenu@index': {
  				templateUrl: 'templates/emerg.html',
  				controller: 'EmergencyController'
  			}
  		}
  	})
  	.state('accept', {
  		parent: 'index',
  		url: '/accept',
  		templateUrl: 'templates/accept.html',
  		controller: 'JobAcceptController'
  	})
    .state('jobAccepted', {
      parent: 'index',
      url: '/jobAccepted',
      templateUrl: 'templates/job-accepted.html',
      controller: 'JobAcceptedController'
    })
    .state('jobStarted', {
      parent: 'index',
      url: '/jobStarted',
      templateUrl: 'templates/job-started.html',
      controller: 'JobStartedController'
    })
    .state('updateBus', {
      url: '/updatebus',
      templateUrl: 'templates/update-bus.html',
      controller: 'UpdateBusController'
    })
    .state('replaceDriver', {
      url: '/replacedriver',
      templateUrl: 'templates/replace-driver.html',
      controller: 'ReplaceDriverController'
    })
  $urlRouterProvider.otherwise('/accept');
});
