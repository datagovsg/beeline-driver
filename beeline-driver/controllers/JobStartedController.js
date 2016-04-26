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
    var pingTimer = true;

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
          pingTimer = false;
          $state.go("app.jobEnded",{status: 0});
        }
      })
    };

    //Display Stops + Passenger Information
    TripService.getTrip(tripData.tripId)
    .then(function(){
      $scope.trip = TripService.trip;
    })
    .then(function(){
      $scope.boardstops = $scope.trip.tripStops.filter(
        stop => stop.canBoard == true);
      console.log($scope.boardstops);
    })
    .then(function(){
      return TripService.getPassengers(tripData.tripId);
    }).then(function(response){
       $scope.passengerData = response.data;

       // group by
       $scope.passengersByStop = _.groupBy($scope.passengerData, psg => psg.boardStopId);
       console.log($scope.passengersByStop);

       angular.forEach($scope.passengersByStop, function(value,key){
         var stop = $scope.boardstops.find(stop => stop.id === parseInt(key));
         stop.noPassenger = value.length;
       });
    });

    //get generated trip code
    TripService.getTripCode(tripData.tripId)
    .then(function(){
      $scope.tripCode = TripService.tripCode;
    })

    gpsStatusTimer = $interval(() => {
      var timeSincePing = new Date().getTime() - $scope.ping.lastPingTime;

      if (timeSincePing > 30000) {
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStausSymbol = "<img class='title-image' src='../image/GPSoff.png' />";
      }
      else {
        $scope.ping.pingStatus = "GPS ON";
        $scope.ping.pingStausSymbol = "<img class='title-image' src='../image/GPSon.png' />";
      }
    }, 5000);

    //Start Up the timer to ping GPS location
    DriverService.getVehicleInfo().then(async function(){
      var vehicleId = DriverService.vehicle[0].id;

      function delay(ms) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        })
      }

      while (pingTimer) {
        try {
          var userPosition = await $cordovaGeolocation.getCurrentPosition({ timeout: 5000, enableHighAccuracy: true })
        }
        catch (error) {
          console.log(error.stack);
          $ionicPopup.alert({
            template: 'Please turn on your GPS Location Service'
          });
          continue;
        }

        try {
          var response = await TripService.sendPing(tripData.tripId, vehicleId, userPosition.coords.latitude, userPosition.coords.longitude);
          if (response) {
            $scope.$apply(() => {
              $scope.ping.lastPingTime = new Date().getTime();
            })
          }
        }
        catch (error) {
          console.log(error.stack);
          $scope.$apply(() => {

          })
        }
        await delay(10000);
      }

    });
  }];
