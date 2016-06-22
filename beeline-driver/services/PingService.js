// Wrapper for making requests to the beeline api
export default[
  "BeelineService",
  "DriverService",
  "$cordovaGeolocation",
  "$interval",
  "$ionicPopup",
  "VerifiedPromptService",
  function(
    BeelineService,
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup,
    VerifiedPromptService
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
        catch (error) {
          console.log("GPS error");
          $interval.cancel(pingInterval);
          await VerifiedPromptService.alert({
            title: "GPS ping fails. Please turn on your Location Service.",
            subTitle: `${error.status} - ${error.message}`
          });
          tryPing();
          pingInterval = $interval(tryPing, 10000);
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
