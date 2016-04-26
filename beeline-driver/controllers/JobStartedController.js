'use strict';
import _ from 'lodash';
export default[
  '$scope',
  '$state',
  'DriverService',
  'TripService',
  '$interval',
  '$cordovaGeolocation',
  function(
    $scope,
    $state,
    DriverService,
    TripService,
    $interval,
    $cordovaGeolocation
  ){

    var tripData = DriverService.getDecodedToken();
    var timer;
    var pingStatus;

    $scope.endTripClick = function() {
      //display popup to let driver confirm whether to really end trip
      console.log('End Trip clicked');
      $interval.cancel(timer);
      $state.go("app.jobEnded",{status: 0});
    };

    $scope.confirmEndTrip = function() {
      $interval.cancel(timer);
    };

    // $scope.$on('$ionicView.leave',()=>{
    //   $interval.cancel(timer);
    // });

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
         $scope.stop.noPassenger = value.length;
       });
    });


    $interval(() => {
      var timeSincePing = new Date().getTime() - $scope.lastPingTime;

      if (timeSincePing > 5000) {
        $scope.pingStatus = 0;
      }
      else {
        $scope.pingStatus = 1;
      }
    }, 1000)

    //Start Up the timer to ping GPS location
    DriverService.getVehicleInfo().then(async function(){
      var vehicleId = DriverService.vehicle[0].id;

      function delay(ms) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        })
      }

      while (true) {
        try {
          var userPosition = await $cordovaGeolocation.getCurrentPosition({ timeout: 5000, enableHighAccuracy: true })
        }
        catch (error) {
          console.log(error.stack);
          $ionicPopup.alert('Please turn on your GPS Location Service')
          continue;
        }

        try {
          var response = await TripService.sendPing(tripData.tripId, vehicleId, userPosition.coords.latitude, userPosition.coords.longitude)
          $scope.$apply(() => {
            $scope.lastPingTime = new Date().getTime();
          })
        }
        catch (error) {
          console.log(error.stack);
          $scope.$apply(() => {
            // $scope.pingStatus = 0;
          })
        }
        await delay(10000);
      }

      // timer = $interval(function(){
      //   $cordovaGeolocation.getCurrentPosition({ timeout: 5000, enableHighAccuracy: true })
      //   .then(function(userPosition) {
      //     //console.log(userPosition);
      //     TripService.sendPing(tripData.tripId, vehicleId, userPosition.coords.latitude, userPosition.coords.longitude)
      //     .then(function (response) {
      //       // success
      //       pingStatus = 1;
      //     })
      //     .then(null, function (error) {
      //       // HTTP error
      //       pingStatus = 0;
      //     });
      //   }, function(error){
      //     alert('Please turn on your GPS Location Service');
      //   });
      // },20000);

    });
  }];
