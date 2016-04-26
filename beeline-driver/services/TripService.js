'use strict';

export default function(DriverService){

  var self = this;
  var latlng = [1.38, 103.8];
  var trip;
  var routepath;

  this.getTrip = function(id){
    return DriverService.beeline({
      method: 'GET',
      url: '/trips/'+id,
    }).then(function(response){
	  self.trip = response.data;
	});
  };

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

}
