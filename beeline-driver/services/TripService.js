import _ from "lodash";
import assert from "assert";
import qs from "querystring";

export default [
  "BeelineService",
  "$interval",
  "$ionicPopup",
  "DriverService",
  function(
    BeelineService,
    $interval,
    $ionicPopup,
    DriverService
  ){
    var self = this;

    //ping starts when start button is pressed
    //ping stops when stop button is pressed
    this.lastPingTime = 0;
    var passengersByStop, passengersByBoardStop, passengersByAlightStop;

    this.assignTrip = async function(routeId) {
      var now = new Date();
      this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      var route = await BeelineService.request({
        method: "GET",
        url: '/routes/'+routeId+'?' + qs.stringify({
          //midnight to midnight
          startDate: this.today,
          endDate: this.today + 24*60*60*1000,
          includeTrips: true
        }),
      });
      if (route.data.trips.length == 0){
        throw new Error("noTrip");
      }
      self.route = route.data;
      //assume route only has one trip per day
      self.trip= self.route.trips[0];
      if (self.trip.status == "cancelled") {
        throw new Error("tripCancelled"+self.trip.id);
      }

      var optionalData={};

      if (DriverService.getVehicleId() != 0) {
          _.merge(optionalData,{vehicleId: DriverService.getVehicleId()})
      }

      var response = await BeelineService.tracking({
        method: "PUT",
        url: '/trips/'+self.trip.id+'/roster',
        data: optionalData
      });

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

    this.getRouteDescription = async function(routeId) {
      try {
        if (self.route && self.route.id == routeId) {
          if (!self.route.description) {
            self.route.description = self.route.label+', '+self.route.from + ' -> '+self.route.to;
          }
          return self.route.description;
        }
        else {
          var route = await BeelineService.request({
            method: "GET",
            url: '/routes/'+routeId
          });
          self.route = route.data;
          self.route.description = self.route.label+', '+self.route.from + ' -> '+self.route.to;
          return self.route.description;
        }
      }
      catch (error) {
        return null;
      }
    }

    this.getPassengers = function(id){
      return BeelineService.request({
        method: "GET",
        url: "/trips/"+id+"/passengers"
      })
      .then(function(response){
        self.passengerData = response.data;
      });
    };

    this.getPassengersByStop = async function(id, reload) {
      if (passengersByStop  && !reload){
        return Promise.resolve(passengersByStop);
      } else{
        await Promise.all([this.getTrip(id, true), this.getPassengers(id)]);
        passengersByBoardStop = _.groupBy(this.passengerData, psg => psg.boardStopId);
        passengersByAlightStop = _.groupBy(this.passengerData, psg => psg.alightStopId);
        passengersByStop = _.merge(passengersByBoardStop, passengersByAlightStop);
        return Promise.resolve(passengersByStop);
      }
    };

    this.cancelTrip = function(tripId){
      return BeelineService.request({
        method: "POST",
        url: "/trips/"+tripId+"/messages?messagePassengers=true",
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
