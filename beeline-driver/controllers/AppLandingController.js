"use strict";

export default[
  "$scope",
  "$state",
  "$timeout",
  "DriverService",
  function(
    $scope,
    $state,
    $timeout,
    DriverService
  ){

    $scope.landing = {
	                                                            driverTxt: "",
	  greetingTxt: 'Welcome Back,',
    };

	                                        $scope.driver = {
	                      name: "",
	};

    var timer;

  //The JSON Web Token that the driver receives will contain everything needed to verify the trip
    DriverService.getDriverInfo().then(function(){
      $scope.driver.name = DriverService.driver.name;
      $scope.driver.telephone = DriverService.driver.telephone;

      $scope.landing.greetingTxt = $scope.landing.greetingLoggedIn;
    timer = $timeout(function(){
      $scope.landing.driverTxt = $scope.driver.name;
    }, 2000);
  });

    //enable the button at the bottom
      $scope.landing.loginBtnTxt = $scope.landing.proceedBtnTxt;

  $scope.$on('$ionicView.beforeEnter',()=>{
      $scope.landing.overlayHide = true;

    if (!timer){
      timer = $timeout(function(){
        $state.go("app.jobAccept");
      }, 2000);
    };
  });


    $scope.$on("$ionicView.beforeEnter",()=>{
      if (!timer){
        timer = $timeout(function(){
          $state.go("app.jobAccept");
        }, 2000);
      }
    });

    $scope.$on("$ionicView.leave",()=>{
      if (timer){
        timer = undefined;
        $timeout.cancel(timer);
      }
    });
  }];
