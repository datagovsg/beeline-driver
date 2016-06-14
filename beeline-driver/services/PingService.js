// Wrapper for making requests to the beeline api
export default[
  "BeelineService",
  "DriverService",
  "$cordovaGeolocation",
  "$interval",
  "$ionicPopup",
  function(
    BeelineService,
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup
  ) {
    var sendPing = async function(tripId) {
        var userPosition = await $cordovaGeolocation.getCurrentPosition({
          timeout: 5000,
          enableHighAccuracy: true
        });

      return BeelineService.request({
        method: "POST",
        url: "/trips/" + tripId + "/pings",
        data: {
          vehicleId: window.localStorage["vehicleId"]!==undefined ? window.localStorage["vehicleId"] : 0,
          latitude: userPosition.coords.latitude,
          longitude: userPosition.coords.longitude
        }
      })
      .then((response) => true);
    };

    var pingInterval = null;
    var self = this;

    this.start = function(tripId) {
      console.log("ping start");
      async function tryPing() {
        try {
          await sendPing(tripId);
          self.lastPingTime = Date.now();
        }
        catch (err) {
          console.log(err)
          //GPS not turned on
          if (err.message == "User denied Geolocation") {
            console.log("GPS error");
            $interval.cancel(pingInterval);
            await $ionicPopup.alert({
              template: "Please turn on your GPS Location Service"
            });
            tryPing();
            pingInterval = $interval(tryPing, 10000);
          }
        }
      }

      if (!pingInterval) {
        tryPing();
        pingInterval = $interval(tryPing, 10000);
      }
    };

    this.stop = function() {
      console.log("ping stop");
      $interval.cancel(pingInterval);
      pingInterval = null;
    };
  }
];
