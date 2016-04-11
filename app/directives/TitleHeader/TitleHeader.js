
export default function (){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      title: '@title',
    },
    templateUrl: './directives/TitleHeader/title-header.html',
    controller: function ($scope,$state) {
      $scope.close = function(){
        $state.go('accept');
      }
    },
  };
}
