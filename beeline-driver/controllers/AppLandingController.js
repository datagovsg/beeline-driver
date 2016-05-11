export default [
  "$scope",
  "DriverService",
  function(
    $scope,
    DriverService
  ){
    DriverService.getDriverInfo()
    .then(function(driver){
      $scope.driver = driver;
    });
  }
];
