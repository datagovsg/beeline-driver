import _ from 'lodash';

export default [
  "$scope",
  "DriverService",
  "TripService",
  function(
    $scope,
    DriverService,
    TripService
  ) {

    $scope.job = {
      path: "",
      tripNumber: "",
      startTime: "",
      startLocation: "",
      endTime: "",
      endLocation: "",
      acceptoff: false
    };

    // //Use the token to grab the trip info
    // TripService.getTrip(DriverService.getDecodedToken().tripId)
    // //Use the trip to grab the route info
    // .then(function(trip){
    //   $scope.job.tripNumber = trip.id;
    //   return TripService.getRoutePath(trip.routeId);
    // })
    // //re-organise the DB output into Google Map compatible JSON
    // .then(function(routePath) {
    //   // Draw the path
    //   $scope.map.lines[0].path = _.map(routePath.path, (point) => ({
    //     latitude: point.lat,
    //     longitude: point.lng
    //   }));
    //   // Extract the start and end descriptions
    //   var routeStartEnd = TripService.routepath.from.split(" to ");
    //   $scope.job.startLocation = routeStartEnd[0];
    //   $scope.job.endLocation = routeStartEnd[1];
    //   // Extract the start and end times
    //   var tripStops = TripService.trip.tripStops;
    //   var startTimeObj = new Date(tripStops[0].time);
    //   var endTimeObj = new Date(tripStops[tripStops.length-1].time);
    //   $scope.job.startTime = startTimeObj.getTime();
    //   $scope.job.endTime = endTimeObj.getTime();
    // });
  }
];
