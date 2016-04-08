angular.module('myApp')
  .directive('titleHeader', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        title: '@title',
      },
      templateUrl: 'directives/TitleHeaderDirective/title-header-directive.html',
      controller: function ($scope,$state) {
        $scope.close = function(){
          $state.go('accept');
        }
      },
    };
  })
