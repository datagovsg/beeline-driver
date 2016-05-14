// Wrapper for making requests to the beeline api
export default function(TokenService, BeelineService, DriverService, 
                        $cordovaGeolocation, $interval) {
  var sendPing = async function() {
    var userPosition = await $cordovaGeolocation.getCurrentPosition({
      timeout: 5000, 
      enableHighAccuracy: true
    });
    var vehicle = await DriverService.getVehicleInfo();
    return BeelineService.request({
      method: "POST",
      url: "/trips/" + TokenService.get("tripId") + "/pings",
      data: {
        vehicleId: vehicle.id,
        latitude: userPosition.coords.latitude,
        longitude: userPosition.coords.longitude
      }
    })
    .then((response) => true);
  };

  var pingInterval;
  
  var self = this;
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

}