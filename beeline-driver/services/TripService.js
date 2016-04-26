'use strict';

export default [
  'DriverService',
  '$cordovaGeolocation',
  '$interval',
  '$ionicPopup',
  function(
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup
  ){
    var self = this;
    var latlng = [1.38, 103.8];
    var trip;
    var tripCode;
    var routepath;
    var pingTimer;
    var lastPingTime;
    var tripId;

    this.getTrip = function(id){
      if (typeof(self.trip)!='undefined'){
        return Promise.resolve(self.trip);
      }
      else return DriverService.beeline({
        method: 'GET',
        url: '/trips/'+id,
      }).then(function(response){
    	  self.trip = response.data;
    	});
    };

    this.getTripCode = function(id){
      return DriverService.beeline({
        method: 'GET',
        url: '/trips/'+id+'/code',
      }).then(function(response){
  	    self.tripCode = response.data;
  	});
    }

    this.getRoutePath = function(id){
      return DriverService.beeline({
        method: 'GET',
          url: '/routes/'+id,
      }).then(function(response){
        self.routepath = response.data;
      });
    };

    this.getPassengers = function(id){
      return DriverService.beeline({
        method: 'GET',
        url: '/trips/'+id+'/get_passengers',
      })
    };

    this.sendPing = function(tripId, vehicleId, lat, lng){
      return DriverService.beeline({
        method: 'POST',
        url: '/trips/'+tripId+'/pings',
        data: {
          vehicleId: vehicleId,
          latitude: lat,
          longitude: lng
        }
      });
    };

    this.sendPingService = async function(id, vehicleId){
      function delay(ms) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        })
      }

      while (self.pingTimer) {
        console.log("start to send");
        var positionOptions = {timeout: 5000, enableHighAccuracy: true};
        try {
          var userPosition = await $cordovaGeolocation.getCurrentPosition(positionOptions);
        }
        catch (error) {
          console.log(error.stack);
          $ionicPopup.alert({
            template: 'Please turn on your GPS Location Service'
          });
          continue;
        }

        try {
          //trip id and vehicle id are hardcoded
          var response = await this.sendPing(id, vehicleId, userPosition.coords.latitude, userPosition.coords.longitude);
          if (response) {
            self.lastPingTime = new Date().getTime();
          }
        }
        catch (error) {
          console.log(error.stack);
        }
        await delay(10000);
      }
    };
  }
]
