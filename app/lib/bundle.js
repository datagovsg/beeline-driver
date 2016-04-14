/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** multi main ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! /Users/xujing/Desktop/beeline-driver/app/app.js */1);


/***/ },
/* 1 */
/*!********************!*\
  !*** ./app/app.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _JobAcceptController = __webpack_require__(/*! ./controllers/JobAcceptController.js */ 2);
	
	var _JobAcceptController2 = _interopRequireDefault(_JobAcceptController);
	
	var _JobAcceptedController = __webpack_require__(/*! ./controllers/JobAcceptedController.js */ 3);
	
	var _JobAcceptedController2 = _interopRequireDefault(_JobAcceptedController);
	
	var _JobStartedController = __webpack_require__(/*! ./controllers/JobStartedController.js */ 4);
	
	var _JobStartedController2 = _interopRequireDefault(_JobStartedController);
	
	var _UpdateBusController = __webpack_require__(/*! ./controllers/UpdateBusController.js */ 5);
	
	var _UpdateBusController2 = _interopRequireDefault(_UpdateBusController);
	
	var _EmergencyController = __webpack_require__(/*! ./controllers/EmergencyController.js */ 6);
	
	var _EmergencyController2 = _interopRequireDefault(_EmergencyController);
	
	var _ReplaceDriverController = __webpack_require__(/*! ./controllers/ReplaceDriverController.js */ 7);
	
	var _ReplaceDriverController2 = _interopRequireDefault(_ReplaceDriverController);
	
	var _TitleHeader = __webpack_require__(/*! ./directives/TitleHeader/TitleHeader.js */ 8);
	
	var _TitleHeader2 = _interopRequireDefault(_TitleHeader);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	angular.module('myApp', ['ui.router', 'uiGmapgoogle-maps']).controller('IndexController', function () {}).controller('JobAcceptController', _JobAcceptController2.default).controller('JobAcceptedController', _JobAcceptedController2.default).controller('JobStartedController', _JobStartedController2.default).controller('UpdateBusController', _UpdateBusController2.default).controller('EmergencyController', _EmergencyController2.default).controller('ReplaceDriverController', _ReplaceDriverController2.default).directive('titleHeader', _TitleHeader2.default).config(function (uiGmapGoogleMapApiProvider) {
	  uiGmapGoogleMapApiProvider.configure({
	    key: 'AIzaSyDC38zMc2TIj1-fvtLUdzNsgOQmTBb3N5M',
	    libraries: 'places'
	  });
	}).config(function ($stateProvider, $urlRouterProvider) {
	  $stateProvider.state('index', {
	    abstract: true,
	    views: {
	      '@': {
	        template: '<div ui-view="sidemenu"></div><div id="contentview" ui-view="content"></div>',
	        controller: 'IndexController'
	      },
	      'content@index': { template: '<div id="content" ui-view=""></div>' },
	      'sidemenu@index': {
	        templateUrl: 'templates/emerg.html',
	        controller: 'EmergencyController'
	      }
	    }
	  }).state('accept', {
	    parent: 'index',
	    url: '/accept',
	    templateUrl: 'templates/accept.html',
	    controller: 'JobAcceptController'
	  }).state('jobAccepted', {
	    parent: 'index',
	    url: '/jobAccepted',
	    templateUrl: 'templates/job-accepted.html',
	    controller: 'JobAcceptedController'
	  }).state('jobStarted', {
	    parent: 'index',
	    url: '/jobStarted',
	    templateUrl: 'templates/job-started.html',
	    controller: 'JobStartedController'
	  }).state('updateBus', {
	    url: '/updatebus',
	    templateUrl: 'templates/update-bus.html',
	    controller: 'UpdateBusController'
	  }).state('replaceDriver', {
	    url: '/replacedriver',
	    templateUrl: 'templates/replace-driver.html',
	    controller: 'ReplaceDriverController'
	  });
	  $urlRouterProvider.otherwise('/accept');
	}); // Declare app level module which depends on views, and components

/***/ },
/* 2 */
/*!************************************************!*\
  !*** ./app/controllers/JobAcceptController.js ***!
  \************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //Gmap default settings
	  $scope.map = {
	    center: { latitude: 1.370244, longitude: 103.823315 },
	    zoom: 10,
	    bounds: { //so that autocomplete will mainly search within Singapore
	      northeast: {
	        latitude: 1.485152,
	        longitude: 104.091837
	      },
	      southwest: {
	        latitude: 1.205764,
	        longitude: 103.589899
	      }
	    },
	    dragging: true,
	    mapControl: {},
	    options: {
	      disableDefaultUI: true,
	      styles: [{
	        featureType: "poi",
	        stylers: [{
	          visibility: "off"
	        }]
	      }],
	      draggable: true
	    },
	    markers: [],
	    lines: [{
	      id: 'routepath',
	      path: [],
	      icons: [{
	        icon: {
	          path: 1,
	          scale: 3,
	          strokeColor: '#333'
	        },
	        offset: '20%',
	        repeat: '50px'
	      }]
	    }]
	  };
	
	  $scope.job = {
	    tripNumber: 'B21',
	    startTime: '7.28am',
	    startRoad: 'Punggol Central',
	    endRoad: 'Anson Road',
	    acceptlimit: 30 * 1000 * 60, //5 min
	    timeleft: 0,
	    timerstarted: false,
	    acceptoff: false,
	    hh: 0,
	    mm: 0,
	    ss: 0
	  };
	  //reset timeleft to acceptlimit at first
	  $scope.job.timeleft = $scope.job.acceptlimit;
	
	  var updateHHMMSS = function updateHHMMSS(timeleft) {
	    var hh = parseInt(timeleft / 1000 / 60 / 60);
	    var mm = parseInt((timeleft - hh * 1000 * 60 * 60) / 1000 / 60);
	    var ss = (timeleft - hh * 1000 * 60 * 60 - mm * 1000 * 60) / 1000;
	    $scope.job.hh = hh;
	    $scope.job.mm = mm;
	    $scope.job.ss = ss;
	  };
	
	  updateHHMMSS($scope.job.timeleft);
	
	  $scope.updateTimer = function () {
	    console.log($scope.job.timeleft);
	    $scope.job.timeleft -= 1000;
	    return $scope.job.timeleft;
	  };
	
	  //Timer starts the moment the user enters the page
	  if ($scope.job.timerstarted == false) {
	    $scope.job.timerstarted = true;
	
	    var timer = setInterval(function () {
	      var timeLeft = $scope.updateTimer();
	      $scope.$apply(function () {
	        updateHHMMSS($scope.job.timeleft);
	      });
	      if (timeLeft <= 0) //kill the timer + disable button
	        {
	          $scope.$apply(function () {
	            $scope.job.acceptoff = true;
	          });
	          clearInterval(timer);
	        }
	    }, 1000);
	  }
	
	  $scope.accept = function () {
	    console.log("clicked");
	    $state.go('jobAccepted');
	  };
	
	  $scope.$on("$destroy", function () {
	    if (timer) {
	      clearInterval(timer);
	    }
	  });
	}];

/***/ },
/* 3 */
/*!**************************************************!*\
  !*** ./app/controllers/JobAcceptedController.js ***!
  \**************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //Gmap default settings
	  $scope.job = {
	    tripNumber: 'B21',
	    startTime: '7.28am',
	    startRoad: 'Punggol Central',
	    endRoad: 'Anson Road'
	  };
	
	  $scope.startJob = function () {
	    $state.go('jobStarted');
	  };
	
	  $scope.updateBus = function () {
	    $state.go('updateBus');
	  };
	}];

/***/ },
/* 4 */
/*!*************************************************!*\
  !*** ./app/controllers/JobStartedController.js ***!
  \*************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //Gmap default settings
	  $scope.job = {
	    tripNumber: 'B21',
	    startTime: '7.28am',
	    startRoad: 'Punggol Central',
	    endRoad: 'Anson Road'
	  };
	}];

/***/ },
/* 5 */
/*!************************************************!*\
  !*** ./app/controllers/UpdateBusController.js ***!
  \************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //Gmap default settings
	  $scope.job = {
	    tripNumber: 'B21',
	    startTime: '7.28am',
	    startRoad: 'Punggol Central',
	    endRoad: 'Anson Road'
	  };
	
	  $scope.loadFile = function (event) {
	    var reader = new FileReader();
	    reader.readAsDataURL(event.target.files[0]);
	    reader.onload = function () {
	      var output = document.getElementById('output');
	      output.src = reader.result;
	    };
	  };
	}];

/***/ },
/* 6 */
/*!************************************************!*\
  !*** ./app/controllers/EmergencyController.js ***!
  \************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //toggles the Open/Close of the Emergency panel
	  $scope.toggleEmerg = function () {
	    var stub = document.getElementById('stub');
	    var emerg = document.getElementById('emerg');
	    var close = document.getElementById('emergclose');
	
	    if (angular.element(stub).hasClass('hide')) {
	      angular.element(stub).removeClass('hide');
	      angular.element(emerg).removeClass('hide');
	    } else {
	      angular.element(stub).addClass('hide');
	      angular.element(emerg).addClass('hide');
	    }
	  };
	
	  $scope.replace = function () {
	    $state.go('replaceDriver');
	  };
	}];

/***/ },
/* 7 */
/*!****************************************************!*\
  !*** ./app/controllers/ReplaceDriverController.js ***!
  \****************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ['$scope', '$state', function ($scope, $state) {
	  //Gmap default settings
	  $scope.job = {
	    tripNumber: 'B21',
	    startTime: '7.28am',
	    startRoad: 'Punggol Central',
	    endRoad: 'Anson Road'
	  };
	}];

/***/ },
/* 8 */
/*!***************************************************!*\
  !*** ./app/directives/TitleHeader/TitleHeader.js ***!
  \***************************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function () {
	  return {
	    restrict: 'E',
	    transclude: true,
	    scope: {
	      title: '@title'
	    },
	    templateUrl: './directives/TitleHeader/title-header.html',
	    controller: function controller($scope, $state) {
	      $scope.close = function () {
	        $state.go('accept');
	      };
	    }
	  };
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map