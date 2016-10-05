var EventEmitter = require('events');

// Wrapper for making requests to the beeline api
export default[
  "BeelineService",
  "DriverService",
  "$interval",
  "$ionicPopup",
  "VerifiedPromptService",
  "$state",
  "$translate",
  "$ionicHistory",
  function(
    BeelineService,
    DriverService,
    $interval,
    $ionicPopup,
    VerifiedPromptService,
    $state,
    $translate,
    $ionicHistory
  ) {

    var gpsOptions = {
      timeout: 15000,
      enableHighAccuracy: true
    }

    var getLocation =  function() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, gpsOptions)
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
    var locationWatch;

    this.events = new EventEmitter();

    this.start = function(tripId) {
      var location, locationError;

      //to make location service is continues
      locationWatch = navigator.geolocation.watchPosition(
        (position) => {
          this.events.emit('locationChanged', position);
          location = position;
          locationError = null;
        },
        (err) => {
          location = null;
          locationError = err;
        },
        gpsOptions
      );

      //to avoid popup shows consecutive twice
      var errorShown = false;
      self.gpsError = false;

      async function tryPing() {
        try {
          let currentlocation = await getLocation();
          if (currentlocation) {
            await sendPing(tripId, currentlocation);
            self.gpsError = false;
            self.lastPingTime = Date.now();
          }
        }
        catch (error) {
          self.gpsError = true;
          //no 2 driver ping the same trip at the same time
          if (error.status == 410 && !errorShown){
            errorShown = true;
            self.stop();
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

      if (locationWatch !== undefined) {
        navigator.geolocation.clearWatch(locationWatch);
        locationWatch = undefined;
      }
    };
  }
];
