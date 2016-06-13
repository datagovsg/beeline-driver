import _ from "lodash";
import assert from "assert";
import qs from "querystring";

export default [
  "BeelineService",
  "$cordovaGeolocation",
  "$interval",
  "$ionicPopup",
  function(
    BeelineService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup
  ){
    var self = this;


    //ping starts when start button is pressed
    //ping stops when stop button is pressed
    this.lastPingTime = 0;
    this.pingTimer = false;
    var passengersByStop;

    this.assignTrip = async function(routeId) {
      var now = new Date();
      this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      var trips = await BeelineService.request({
        method: "GET",
        url: '/routes/'+routeId+'?' + qs.stringify({
          //midnight to midnight
          start_date: this.today,
          end_date: this.today + 24*60*60*1000,
          include_trips: true
        }),
      });
      //assume route only has one trip per day
      if (trips !== undefined)
      {
        self.trip= trips.data.trips[0];
        console.log(self.trip);
      }

      var response = await BeelineService.request({
        method: "PUT",
        url: '/trips/'+self.trip.id+'/setDriver'
      })
      self.trip = response.data;
      return self.trip.id;
    }

    this.getTrip = function(id, reload){
      if ( self.trip !== undefined && !reload ){
        return Promise.resolve(self.trip);
      }
      else return BeelineService.request({
        method: "GET",
        url: "/trips/"+id
      }).then(function(response){
        self.trip = response.data;
        return response.data;
      });
    };

    this.getTripCode = function(id){
      return BeelineService.request({
        method: "GET",
        url: "/trips/"+id+"/code"
      })
      .then(function(response){
        return self.tripCode = response.data;
      });
    };

    this.getPassengers = function(id){
      return BeelineService.request({
        method: "GET",
        url: "/trips/"+id+"/get_passengers"
      })
      .then(function(response){
        self.passengerData = response.data;
      });
    };

    this.getPassengersByStop = async function(id, ignoreCache) {
      if (passengersByStop  && !ignoreCache){
        return Promise.resolve(passengersByStop);
      } else{
        await this.getTrip(id);
        var boardStops = this.trip.tripStops.filter(
          stop => stop.canBoard == true);
        this.boardStops = _.sortBy(boardStops, function(item){
          return item.time;
        });
        await this.getPassengers(id);
        passengersByStop = _.groupBy(this.passengerData, psg => psg.boardStopId);
        return Promise.resolve(passengersByStop);
      }
    };

    this.cancelTrip = function(tripId){
      return BeelineService.request({
        method: "POST",
        url: "/trips/"+tripId+"/statuses",
        data: {
          message: "vehicle break down",
          status: "cancelled"
        }
      })
      .then(function(response){
        return true;
      });
    };

    //link to driver instead of vehicle
    this.sendPing = function(tripId, vehicleId, lat, lng){
      return BeelineService.request({
        method: "POST",
        url: "/trips/"+tripId+"/pings",
        data: {
          vehicleId: vehicleId,
          latitude: lat,
          longitude: lng
        }
      })
      .then(function(response){
        return true;
      });
    };

    //function to send ping with setInterval
    this.sendPingService = async function(id, vehicleId, callback){
      function delay(ms) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        });
      }
      while (this.pingTimer) {
        console.log("start to send");
        var positionOptions = {timeout: 5000, enableHighAccuracy: true};
        try {
          var userPosition = await $cordovaGeolocation.getCurrentPosition(positionOptions);
        }
        catch (error) {
          console.log(error.stack);
          await $ionicPopup.alert({
            template: "Please turn on your GPS Location Service"
          });
          continue;
        }
        try {
          //trip id and vehicle id are hardcoded
          var response = await this.sendPing(id, vehicleId, userPosition.coords.latitude, userPosition.coords.longitude);
          if (response) {
            self.lastPingTime = new Date().getTime();
            if (callback) {
              callback(self.lastPingTime);
            }
          }
        }
        catch (error) {
          console.log(error.stack);
        }
        await delay(10000);
      }
    };
  }
];
