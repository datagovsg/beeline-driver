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
  "$ionicHistory",
  function(
    BeelineService,
    DriverService,
    $cordovaGeolocation,
    $interval,
    $ionicPopup,
    VerifiedPromptService,
    $state,
    $translate,
    $ionicHistory
  ) {
    var successHandler = async function(location) {
      await sendPing(self.tripId, location);
      self.gpsError = false;
      self.lastPingTime = Date.now();
    }

    var failHandler = function (error) {
      throw error;
    }

    var getLocation =  function() {
      navigator.geolocation.getCurrentPosition(successHandler, failHandler, {
        timeout: 15000,
        enableHighAccuracy: true
      })
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
      self.tripId = tripId;
      self.gpsError = false;
      async function tryPing() {
        try {
          getLocation();
        }
        catch (error) {
          self.gpsError = true;
          //no 2 driver ping the same trip at the same time
          if (error.status == 410){
            $interval.cancel(pingInterval);
            var transition = await $translate(['ANOTHER_DRIVER_TOOK_JOB']);
            await VerifiedPromptService.alert({
              title: transition.ANOTHER_DRIVER_TOOK_JOB,
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
      $interval.cancel(pingInterval);
      pingInterval = null;
    };
  }
];
