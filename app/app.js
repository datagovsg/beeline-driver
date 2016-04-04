// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ui.router',
  'uiGmapgoogle-maps',
  'myApp.version'
])
.controller('indexCtrl', function(){})
.controller('jobAcceptCtrl', JobAcceptController)
.controller('jobAcceptedCtrl', JobAcceptedController)
.controller('jobStartedCtrl', JobStartedController)
.controller('updateBusCtrl', UpdateBusController)
.controller('emergencyCtrl', EmergencyController)
.controller('replaceDriverCtrl', ReplaceDriverController)
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
					controller: 'indexCtrl'
				},
				'content@index': { template: '<div id="content" ui-view=""></div>'},
				'sidemenu@index': {
					templateUrl: 'templates/emerg.html',
					controller: 'emergencyCtrl'
				}
			}
		})
		.state('accept', {
			parent: 'index',
			url: '/accept',
			templateUrl: 'templates/accept.html',
			controller: 'jobAcceptCtrl'
		})
        .state('jobAccepted', {
            parent: 'index',
            url: '/jobAccepted',
            templateUrl: 'templates/jobaccepted.html',
            controller: 'jobAcceptedCtrl'
        })
        .state('jobStarted', {
            parent: 'index',
            url: '/jobStarted',
            templateUrl: 'templates/jobstarted.html',
            controller: 'jobStartedCtrl'
        })
        .state('updateBus', {
            url: '/updatebus',
            templateUrl: 'templates/updatebus.html',
            controller: 'updateBusCtrl'
        })
        .state('replaceDriver', {
            url: '/replacedriver',
            templateUrl: 'templates/replacedriver.html',
            controller: 'replaceDriverCtrl'
        })
	$urlRouterProvider.otherwise('/accept');
});
