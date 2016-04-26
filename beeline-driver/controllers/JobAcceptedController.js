'use strict';

export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  function(
    $scope,
    $state,
    DriverService,
    TripService
  ){

    $scope.vehicle = {
      id: '',
      vehicleNumber: '',
    };

    $scope.driver = {
      name: '',
      telephoneNo: '',
    }

    var tripData = DriverService.getDecodedToken();

    if (typeof(tripData) != 'undefined') {
      DriverService.getVehicleInfo().then(function(){

        //find out the driver's vehicle number
        $scope.vehicle.id = DriverService.vehicle[0].id;
        $scope.vehicle.vehicleNumber = DriverService.vehicle[0].vehicleNumber;
      });
    }

    DriverService.getDriverInfo().then(function(){
      $scope.driver.name = DriverService.driver.name;
      $scope.driver.telephoneNo = DriverService.driver.telephone;
    })
  }];
