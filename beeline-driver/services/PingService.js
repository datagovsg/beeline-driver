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
        self.error = true;
        console.log(error);
        console.log("GPS error");
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
        self.error = true;
        //no 2 driver ping the same trip at the same time
        if (error.status == 410){
          $interval.cancel(pingInterval);
          await VerifiedPromptService.alert({
            title: "Another driver took this job",
          });
          $state.go("app.route");
        }
      }
    }


    var pingInterval = null;
    var self = this;

    this.start = function(tripId) {
      console.log("ping start");
      self.error = false;
      async function tryPing() {
        try {
          var location = await getLocation();
          if (location){
            await sendPing(tripId, location);
            self.error = false;
            self.lastPingTime = Date.now();
          }
        }
        catch (error) {
          self.error = true;
          console.log("Error");
          console.log(error);
        }
      }

      if (!pingInterval) {
        tryPing();
        //every 10s send ping
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
