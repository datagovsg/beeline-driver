'use strict';

export default[
  '$scope',
  '$state',
  '$timeout',
  'DriverService',
  function(
    $scope,
    $state,
    $timeout,
    DriverService
  ){

  $scope.landing = {
	  driverTxt: '',
	  greetingTxt: 'Welcome Back,',
  };

	$scope.driver = {
	  name: '',
	};

  var timer;

  //The JSON Web Token that the driver receives will contain everything needed to verify the trip
  DriverService.getDriverInfo().then(function(){
    $scope.driver.name = DriverService.driver.name;
    $scope.landing.driverTxt = $scope.driver.name;

    //auto-redirect in 2 seconds
    timer = $timeout(function(){
      $state.go('app.jobAccept');
    }, 2000);
  });


  $scope.$on('$ionicView.beforeEnter',()=>{
    if (!timer){
      timer = $timeout(function(){
        $state.go('app.jobAccept');
      }, 2000);
    }
  });

  $scope.$on('$ionicView.leave',()=>{
    if (timer){
      timer = undefined;
      $timeout.cancel(timer);
    }
  });
}]
