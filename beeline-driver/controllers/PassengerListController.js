import _ from "lodash";
export default[
  "$scope",
  "$stateParams",
  "TripService",
  async function(
    $scope,
    $stateParams,
    TripService
  ){
    $scope.data ={
      tripId: $stateParams.tripId || undefined,
      stopId: $stateParams.stopId || undefined
    }
    //Display Stops + Passenger Information
    var trip = await TripService.getTrip($scope.data.tripId);
    var boardStops = trip.tripStops.filter( stop => stop.canBoard );
    var stop = _.find(boardStops, {"id": +$scope.data.stopId }).stop;
    $scope.stopDescription = stop.description + ", " + stop.road;
    var passengersByStop = await TripService.getPassengersByStop($scope.data.tripId);
    $scope.passengerList = passengersByStop[+($scope.data.stopId)];

    //FIXME wrs special case
    // //wrs user name {name:, email:, telephone:}
    // if ($scope.passengerList !== 'undefined') {
    //   for (let p of $scope.passengerList) {
    //     try {
    //       let jsonObj = JSON.parse(p.name);
    //       _.assign(p, jsonObj)
    //     }catch (err) {
    //       console.log(err.stack);
    //     }
    //   }
    // }

  }];
