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
    overlayHide: false,
	  greetingTxt: '',
	  driverTxt: '',
	  greetingLoggedIn: 'Welcome Back,',
	  greetingNotLoggedIn: 'Hello Driver,',
	  driverNotLoggedIn: 'Please Log In to Accept your Job.',
    proceedBtnTxt: 'Proceed',
    initTxt: 'Initialising job data...'
  };

	$scope.driver = {
	  loggedIn: true, //assume user of driver app is a valid user
	  id: '',
	  name: '',
	  telephone: ''
	};

  var timer;

  //The JSON Web Token that the driver receives will contain everything needed to verify the trip
  DriverService.getDriverInfo().then(function(){
    $scope.driver.name = DriverService.driver.name;
    $scope.driver.telephone = DriverService.driver.telephone;

    $scope.landing.greetingTxt = $scope.landing.greetingLoggedIn;
    $scope.landing.driverTxt = $scope.driver.name;


    //remove overlay
    $scope.landing.overlayHide = true;

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
