import _ from 'lodash';

export default [
  "$scope",
  "$state",
  "$interval",
  "DriverService",
  "TripService",
  "uiGmapGoogleMapApi",
  function(
    $scope,
    $state,
    $interval,
    DriverService,
    TripService,
    uiGmapGoogleMapApi
  ) {

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

    $scope.job = {
      path: "",
      tripNumber: "",
      startTime: "",
      startLocation: "",
      endTime: "",
      endLocation: "",
      acceptoff: false
    };

    //Use the token to grab the trip info
    TripService.getTrip(DriverService.getDecodedToken().tripId)
    //Use the trip to grab the route info
    .then(function(trip){ 
      $scope.job.tripNumber = trip.id;
      return TripService.getRoutePath(trip.routeId);
    })
    //re-organise the DB output into Google Map compatible JSON
    .then(function(routePath) { 
      // Draw the path
      $scope.map.lines[0].path = _.map(routePath.path, (point) => ({
        latitude: point.lat,
        longitude: point.lng
      }));
      // Extract the start and end descriptions
      var routeStartEnd = TripService.routepath.from.split(" to ");
      $scope.job.startLocation = routeStartEnd[0];
      $scope.job.endLocation = routeStartEnd[1];
      // Extract the start and end times
      var tripStops = TripService.trip.tripStops;
      var startTimeObj = new Date(tripStops[0].time);
      var endTimeObj = new Date(tripStops[tripStops.length-1].time);
      $scope.job.startTime = startTimeObj.getTime();
      $scope.job.endTime = endTimeObj.getTime();
    });
  }
];
