"use strict";
import _ from "lodash";
export default[
  "$scope",
  "$state",
  "DriverService",
  "TripService",
  "$interval",
  "$cordovaGeolocation",
  "$ionicPopup",
  "TokenService",
  async function(
    $scope,
    $state,
    DriverService,
    TripService,
    $interval,
    $cordovaGeolocation,
    $ionicPopup,
    TokenService
  ){

    var gpsStatusTimer;

    $scope.media = "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA" + 
    "0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAA" + 
    "AAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQA" +
    "AAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawA" +
    "AAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAA" + 
    "AAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAA" + 
    "AAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAA" + 
    "AVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABx" + 
    "kcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA" + 
    "0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUA" +
    "AAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQI" + 
    "AAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAA" + 
    "AFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGE" + 
    "AAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwA" + 
    "AABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==";

    $scope.ping ={
      pingStatus : null,
      pingStatusSymbol: null,
      lastPingTime : null
    };

    $scope.confirmEndTrip = function() {
      $ionicPopup.confirm({
        title: "Confirm End Trip",
        template: "Are you sure?",
        okType: "button-royal"
      })
      .then(function(response){
        if(response){
          if (gpsStatusTimer) {
            $interval.cancel(gpsStatusTimer);
          }
          TripService.pingTimer = false;
          $state.go("app.jobEnded",{status: "tripEnded"});
        }
      });
    };

    //get generated trip code
    $scope.tripCode = await TripService.getTripCode();

    // Get the stop info
    var trip = await TripService.getTrip();
    var boardStops = trip.tripStops.filter( stop => stop.canBoard );
    $scope.boardStops = boardStops;

    // Count the passengers per stop
    var passengersByStopId = await TripService.getPassengersByStop();
    _.forEach(passengersByStopId, function(value, key) {
      var stop = boardStops.find(stop => stop.id === +key);
      stop.passengerNumber = value.length;
    });

    gpsStatusTimer = $interval(() => {
      $scope.ping.lastPingTime = TripService.lastPingTime;
      var timeSincePing = new Date().getTime() - $scope.ping.lastPingTime;

      if (timeSincePing > 30000) {
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
      }
      else {
        $scope.ping.pingStatus = "GPS ON";
        $scope.ping.pingStatusSymbol = "image/GPSon.svg";
      }
    }, 5000);

    //Start Up the timer to ping GPS location
    DriverService.getVehicleInfo()
    .then(async function(vehicle){
      var vehicleId = vehicle.id;
      //start to ping
      TripService.pingTimer = true;
      TripService.sendPingService(TokenService.get("tripId"), vehicleId);
    });

    $scope.showPassengerList = function(id){
      $state.go("app.passengerList",{stopId: id});
    };
  }];
