'use strict';

angular.module('myApp.utility.utility-directive', [])

.directive('myHeader', function() {
    return {
         restrict: 'E',
         transclude: true,
         scope: {
             title: '@myTitle',
         },
         templateUrl: './components/utility/my-header.html',
         controller: function ($scope,$state) {
              $scope.close = function(){
                  $state.go('accept');
              }
        },
   };
});
