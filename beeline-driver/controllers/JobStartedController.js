'use strict';
import _ from 'lodash';
export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  '$interval',
  '$cordovaGeolocation',
  '$ionicPopup',
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
      pingStausSymbol: null,
      lastPingTime : null
    }

    $scope.endTripClick = function() {
      console.log('End Trip clicked');
      //display popup to let driver confirm whether to really end trip
      this.confirmEndTrip();
    };

    $scope.confirmEndTrip = function() {
      $ionicPopup.confirm({
        title: 'Confirm End Trip',
        template: 'Are you sure you want to end trip?',
      }).then(function(response){
        if(response){
          if (gpsStatusTimer) {
            $interval.cancel(gpsStatusTimer);
          }
          TripService.pingTimer = false;
          $state.go("app.jobEnded",{status: 0});
        }
      })
    };

    //Display Stops + Passenger Information
    TripService.getPassengersByStop(tripData.tripId)
    .then(function(){
      console.log(TripService.passengersByStop);
      $scope.boardstops = TripService.boardstops;
      $scope.passengersByStop = TripService.passengersByStop;
      angular.forEach($scope.passengersByStop, function(value,key){
        var stop = $scope.boardstops.find(stop => stop.id === parseInt(key));
        stop.noPassenger = value.length;
    });
  })

    //get generated trip code
    TripService.getTripCode(tripData.tripId)
    .then(function(){
      $scope.tripCode = TripService.tripCode;
    })

    gpsStatusTimer = $interval(() => {
      $scope.ping.lastPingTime = TripService.lastPingTime;
      var timeSincePing = new Date().getTime() - $scope.ping.lastPingTime;

      if (timeSincePing > 30000) {
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStausSymbol = "<img class='title-image' src='../image/GPSoff.svg' />";
      }
      else {
        $scope.ping.pingStatus = "GPS ON";
        $scope.ping.pingStausSymbol = "<img class='title-image' src='../image/GPSon.svg' />";
      }
    }, 5000);

    //Start Up the timer to ping GPS location
    DriverService.getVehicleInfo().then(async function(){
      var vehicleId = DriverService.vehicle[0].id;
      //start to ping
      TripService.pingTimer = true;
      TripService.sendPingService(tripData.tripId, vehicleId,
        () => { $scope.$apply() });
    });

    $scope.showPassengerList = function(id){
      $state.go('app.passengerList',{stopId: id});
    }
}];
