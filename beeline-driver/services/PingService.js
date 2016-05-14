// Wrapper for making requests to the beeline api
export default function(TokenService, BeelineService, DriverService, 
                        $cordovaGeolocation, $interval) {
  var self = this;

  var sendPing = async function() {
    try {
      var userPosition = await $cordovaGeolocation.getCurrentPosition({
        timeout: 5000, 
        enableHighAccuracy: true
      });
    }
    catch (error) {
      console.error(error);
      return;
    }
    var vehicle = await DriverService.getVehicleInfo();
    return BeelineService.request({
      method: "POST",
      url: "/trips/" + TokenService.get('tripId') + "/pings",
      data: {
        vehicleId: vehicle.id,
        latitude: userPosition.coords.latitude,
        longitude: userPosition.coords.longitude
      }
    })
    .then((response) => true);
  };

  var pingInterval;

  this.start = function() {
    $interval.cancel(pingInterval);
    pingInterval = $interval(async function() {
      await sendPing();
      self.lastPingTime = Date.now();
    }, 10000);
  };

  this.stop = function() {
    $interval.cancel(pingInterval);
  };

};