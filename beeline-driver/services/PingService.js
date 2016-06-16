// Wrapper for making requests to the beeline api
export default[
  "BeelineService",
  "DriverService",
  "$cordovaGeolocation",
  "$interval",
  "$ionicPopup",
  "VerifiedPromptService",
  "$state",
  function(
    BeelineService,
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup,
    VerifiedPromptService,
    $state
  ) {
    var getLocation = async function() {
      try{
        var userPosition = await $cordovaGeolocation.getCurrentPosition({
          timeout: 15000,
          enableHighAccuracy: true
        });
        return userPosition;
      }
      catch(error) {
        console.log(error);
        console.log("GPS error");
        $interval.cancel(pingInterval);
        await VerifiedPromptService.alert({
          title: "GPS error. Please turn on your Location Service.",
          subTitle: `${error.message}`
        });
      }
    };

    var sendPing = async function(tripId, loc){
      try {
        await BeelineService.request({
          method: "POST",
          url: "/trips/" + tripId + "/pings",
          data: {
            vehicleId: window.localStorage["vehicleId"]!==undefined ?
              window.localStorage["vehicleId"] : 0,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          }
        })
      }
      catch(error) {
        console.log(error);
        console.log("Server error");
        $interval.cancel(pingInterval);
        if (error.status == 410){
          await VerifiedPromptService.alert({
            title: "Another driver took this job",
          });
          $state.go("app.route");
        }
        else await VerifiedPromptService.alert({
          title: "Server error.",
          subTitle: `${error.status} - ${error.message}`
        });
      }
    }

    var pingInterval = null;
    var self = this;

    this.start = function(tripId) {
      console.log("ping start");
      async function tryPing() {
        try {
          var location = await getLocation();
          await sendPing(tripId, location);
          self.lastPingTime = Date.now();
        }
        catch (error) {
          console.log("Error");
          console.log(error);
          $interval.cancel(pingInterval);
          await VerifiedPromptService.alert({
            title: "Error",
            subTitle: `${error.status} - ${error.message}`
          });
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
