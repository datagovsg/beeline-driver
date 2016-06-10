// Wrapper for making requests to the beeline api
export default function(TokenService, BeelineService, DriverService,
                        $cordovaGeolocation, $interval, $rootScope,
                      $state) {
  var sendPing = async function(tripId) {
    var userPosition = await $cordovaGeolocation.getCurrentPosition({
      timeout: 5000,
      enableHighAccuracy: true
    });
    //FIXME enable driver to add/update vehicle
    // var vehicle = await DriverService.getVehicleInfo();
    return BeelineService.request({
      method: "POST",
      url: "/trips/" + tripId + "/pings",
      data: {
        //Fixme vehicle is dynamic
        vehicleId: 0,
        latitude: userPosition.coords.latitude,
        longitude: userPosition.coords.longitude
      }
    })
    .then((response) => true);
  };

  var pingInterval = null;
  var self = this;

  this.start = function() {
    async function tryPing() {
      try {
        await sendPing();
        self.lastPingTime = Date.now();
      }
      catch (err) {
        console.log(err)
      }
    }

    if (!pingInterval) {
      tryPing();
      pingInterval = $interval(tryPing, 10000)
    }
  };

  this.stop = function() {
    $interval.cancel(pingInterval);
    pingInterval = null;
  };


  function startStopTimer(event, toState) {
    if (toState.data && toState.data.sendPings) {
      console.log("ping start")
      self.start();
    }
    else {
      console.log("ping stop")
      self.stop();
    }
  }

  $rootScope.$on('$stateChangeSuccess', startStopTimer);
  startStopTimer(null, $state.current);

}
