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
    this.isPinging = false;
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
        if (self.trip.status == "cancelled") {
          throw new Error("tripCancelled");
        }
      }

      var optionalData={};

      if (window.localStorage["vehicleId"]!==undefined
        && window.localStorage["vehicleId"]!=0) {
          _.merge(optionalData,{vehicleId: window.localStorage["vehicleId"]})
      }

      var response = await BeelineService.request({
        method: "PUT",
        url: '/trips/'+self.trip.id+'/setDriver',
        data: optionalData
      });

      self.trip = response.data;
      return self.trip.id;
    }

    this.getCacheTrip = function() {
      return self.trip;
    }

    this.getTrip = function(id, reload){
      if ( self.trip !== undefined && !reload ){
        console.log(self.trip);
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

    this.getPassengersByStop = async function(id, reload) {
      if (passengersByStop  && !reload){
        return Promise.resolve(passengersByStop);
      } else{
        await this.getTrip(id, true);
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
          status: "cancelled"
        }
      })
      .then(function(response){
        return true;
      });
    };

  }
];
