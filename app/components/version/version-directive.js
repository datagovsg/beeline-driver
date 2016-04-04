'use strict';

angular.module('myApp.version.version-directive', [])


//directive is app-version
//'version' is to avoid min js error
.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
