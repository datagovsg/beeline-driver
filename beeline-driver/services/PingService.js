// Wrapper for making requests to the beeline api
export default[
  "BeelineService",
  "DriverService",
  "$cordovaGeolocation",
  "$interval",
  "$ionicPopup",
  "VerifiedPromptService",
  "$state",
  "$translate",
  function(
    BeelineService,
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup,
    VerifiedPromptService,
    $state,
    $translate
  ) {
    var getLocation =  function() {
      return $cordovaGeolocation.getCurrentPosition({
        timeout: 15000,
        enableHighAccuracy: true
      }).then(function(response){
        return response;
      });
    };

    var sendPing = function(tripId, loc){
      return BeelineService.request({
        method: "POST",
        url: "/trips/" + tripId + "/pings",
        data: {
          vehicleId: DriverService.getVehicleId(),
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        }
      }).then(function(response){
        return response.data;
      });
    };

    var pingInterval = null;
    var self = this;

    this.start = function(tripId) {
      console.log("ping start");
      self.gpsError = false;
      async function tryPing() {
        try {
          var location = await getLocation();
          await sendPing(tripId, location);
          self.gpsError = false;
          self.lastPingTime = Date.now();
        }
        catch (error) {
          self.gpsError = true;
          //no 2 driver ping the same trip at the same time
          if (error.status == 410){
            $interval.cancel(pingInterval);
            await VerifiedPromptService.alert({
              title: "Another driver took this job",
            });
            //choose-route has no back view to start
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go("app.route");
          }
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
