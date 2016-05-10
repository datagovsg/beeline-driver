"use strict";

export default[
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
  ){

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

    $scope.fillInTripRouteData = function() {
//re-organise the DB output into Google Map compatible JSON
      var pathTemp = [];
      for (var i = 0; i < TripService.routepath.path.length; i++) {
        pathTemp.push({
          latitude: TripService.routepath.path[i].lat,
          longitude: TripService.routepath.path[i].lng
        });
      }

      var routeStartEnd = TripService.routepath.from.split(" to ");
      var tripStops = TripService.trip.tripStops;
      var startTimeObj = new Date(tripStops[0].time);
      var endTimeObj = new Date(tripStops[tripStops.length-1].time);

      $scope.job.path = pathTemp;
      $scope.job.startLocation = routeStartEnd[0];
      $scope.job.endLocation = routeStartEnd[1];
      $scope.job.startTime = startTimeObj.getTime();
      $scope.job.endTime = endTimeObj.getTime();

      $scope.map.lines[0].path = $scope.job.path;
    };

    //Grab Trip and Route info

    TripService.getTrip(DriverService.getDecodedToken().tripId).then(function(){ //grab trip info
      console.log(TripService.trip);
      $scope.job.tripNumber = TripService.trip.id;
      return TripService.getRoutePath(TripService.trip.routeId);
    }).then(function() { //grab route info
      //populate $scope.job with the relevant data
      $scope.fillInTripRouteData();
      return uiGmapGoogleMapApi;
    }).then(function(googleMaps) {
    }); //end Promise

  }];
