import _ from "lodash";

export default function(
  DriverService,
  $cordovaGeolocation,
  $interval,
  $ionicPopup,
  BeelineService,
  TokenService
){
  var self = this;
  this.lastPingTime = 0;
  this.pingTimer = false;
  var passengersByStop;
  var tripCache = null;
  var tripCodeCache = null;
  var routeCache = null;
  var passengerCache = null;


  this.getTrip = function(ignoreCache) {
    if (tripCache && !ignoreCache) { 
      return Promise.resolve(tripCache);
    }
    return BeelineService.request({
      method: "GET",
      url: "/trips/" + TokenService.get("tripId")
    })
    .then(function(response) {
      tripCache = response.data;
      return tripCache;
    });
  };

  this.getTripCode = function(ignoreCache) {
    if (tripCodeCache && !ignoreCache) {
      return Promise.resolve(tripCodeCache);
    }
    return BeelineService.request({
      method: "GET",
      url: "/trips/" + TokenService.get("tripId") + "/code"
    })
    .then(function(response){
      tripCodeCache = response.data;
      return tripCodeCache;
    });
  };

  this.getRoute = async function(ignoreCache) {
    if (routeCache && !ignoreCache) {
      return Promise.resolve(routeCache);
    }
    var trip = await self.getTrip();
    return BeelineService.request({
      method: "GET",
      url: "/routes/" + trip.routeId
    })
    .then(function(response) {
      routeCache = response.data;
      return routeCache;
    });
  };

  this.getPassengers = function(ignoreCache) {
    if (passengerCache && !ignoreCache) {
      return passengerCache;
    }
    return BeelineService.request({
      method: "GET",
      url: "/trips/" + TokenService.get("tripId") + "/get_passengers"
    })
    .then(function(response){
      passengerCache = response.data;
      return passengerCache;
    });
  };

  this.getPassengersByStop = async function(ignoreCache) {
    if (passengersByStop  && !ignoreCache) {
      return Promise.resolve(passengersByStop);
    } 
    var trip = await self.getTrip();
    var boardStops = trip.tripStops.filter( stop => stop.canBoard );
    boardStops = _.sortBy(boardStops, item => item.time );
    var passengerData = await this.getPassengers(TokenService.get("tripId"));
    passengersByStop = _.groupBy(passengerData, psg => psg.boardStopId);
    return Promise.resolve(passengersByStop);
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

  this.notifyTripLate = function(tripId){
    return BeelineService.request({
      method: "POST",
      url: "/trips/"+tripId+"/statuses",
      data: {
        message: "15 mins late",
        status: "late"
      }
    })
    .then(function(response){
      return true;
    });
  };

}