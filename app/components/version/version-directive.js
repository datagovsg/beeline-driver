'use strict';

angular.module('myApp.version.version-directive', [])


//directive is app-version
//'version' is to avoid min js error
.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}])

.directive('myHeader', function() {
    return {
         restrict: 'E',
         transclude: true,
         scope: {
             title: '@myTitle',
         },
         templateUrl: './components/version/my-header.html',
         controller: function ($scope,$state) {
              $scope.close = function(){
                  $state.go('accept');
              }
        },
   };
});
