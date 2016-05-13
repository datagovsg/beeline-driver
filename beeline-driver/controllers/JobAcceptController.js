export default ["$scope", "TripService", async function($scope, TripService) {

  //Gmap default settings
  $scope.map = {
    center: { latitude: 1.370244, longitude: 103.823315 },
    zoom: 10,
    bounds: { //so that autocomplete will mainly search within Singapore
      northeast: {
        latitude: 1.485152,
        longitude: 104.091837
      },
      southwest: {
        latitude: 1.205764,
        longitude: 103.589899
      }
    },
    dragging: true,
    control: {},
    options: {
      disableDefaultUI: true,
      styles: [{
        featureType: "poi",
        stylers: [{
          visibility: "off"
        }]
      }],
      draggable: true
    },
    markers: [],
    lines: [{
      id: "routepath",
      path: [],
      icons: [{
        icon: {
          path: 1,
          scale: 3,
          strokeColor: "#333"
        },
        offset: "20%",
        repeat: "50px"
      }]
    }]
  };

  var trip = await TripService.getTrip();
  var route = await TripService.getRoute();

  // Extract the start and end descriptions
  $scope.tripNumber = trip.id;
  var routeStartEnd = route.from.split(" to ");
  $scope.startLocation = routeStartEnd[0];
  $scope.endLocation = routeStartEnd[1];

  // Extract the start and end times
  var tripStops = trip.tripStops;
  var startTimeObj = new Date(tripStops[0].time);
  var endTimeObj = new Date(tripStops[tripStops.length-1].time);
  $scope.startTime = startTimeObj.getTime();
  $scope.endTime = endTimeObj.getTime();

  // Draw the path
  $scope.map.lines[0].path = _.map(route.path, (point) => ({
    latitude: point.lat,
    longitude: point.lng
  }));

}];
