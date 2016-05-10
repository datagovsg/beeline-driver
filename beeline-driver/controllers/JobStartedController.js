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
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $interval,
    $cordovaGeolocation,
    $ionicPopup
  ){

    var tripData = DriverService.getDecodedToken();
    var gpsStatusTimer;

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

    //Display Stops + Passenger Information
    TripService.getPassengersByStop(tripData.tripId)
    .then(function(response){
      $scope.boardStops = TripService.boardStops;
      $scope.passengersByStop = response;
      _.forEach($scope.passengersByStop, function(value,key){
        var stop = $scope.boardStops.find(stop => stop.id === +key);
        stop.passengerNumber = value.length;
      });
    });

    //get generated trip code
    TripService.getTripCode(tripData.tripId)
    .then(function(){
      $scope.tripCode = TripService.tripCode;
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
      TripService.sendPingService(tripData.tripId, vehicleId);
    });

    $scope.showPassengerList = function(id){
      $state.go("app.passengerList",{stopId: id});
    };
  }];
