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
    //Display Stops + Passenger Information
    var trip = await TripService.getTrip();
    var boardStops = trip.tripStops.filter( stop => stop.canBoard );
    var stop = _.find(boardStops, {"id": +$stateParams.stopId }).stop;
    $scope.stopDescription = stop.description + ", " + stop.road;
    var passengersByStop = await TripService.getPassengersByStop();
    $scope.passengerList = passengersByStop[+$stateParams.stopId];

    //wrs user name {name:, email:, telephone:}
    if ($scope.passengerList !== 'undefined') {
      for (let p of $scope.passengerList) {
        try {
          let jsonObj = JSON.parse(p.name);
          _.assign(p, jsonObj)
        }catch (err) {
          console.log(err.stack);
        }
      }
    }

  }];
