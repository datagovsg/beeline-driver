
export default function (){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      title: '@title',
      nextState: '@nextState',
    },
    templateUrl: './directives/TitleHeader/title-header.html',
  };
}
