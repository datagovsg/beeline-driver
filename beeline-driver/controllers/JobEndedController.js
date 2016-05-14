export default[
  "$scope",
  "$stateParams",
  "TripService",
  function(
    $scope,
    $stateParams,
    TripService
  ){
    $scope.job = {};
    TripService.getTrip()
    .then(function(trip){
      $scope.job.tripId = trip.id;
      $scope.job.date = trip.date;
    });
    $scope.job.status = $stateParams.status;
    $scope.job.replacementPhoneNumber = +$stateParams.replacementPhoneNumber;
  }
];
