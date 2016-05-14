import _ from "lodash";
export default[
  "$scope",
  "$state",
  "TripService",
  "$ionicPopup",
  "TokenService",
  "PingService",
  "$timeout",
  async function(
    $scope,
    $state,
    TripService,
    $ionicPopup,
    TokenService,
    PingService,
    $timeout
  ){

    // Dummy media file which stops the page from going to sleep
    $scope.media = "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA" +
    "0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAA" +
    "AAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQA" +
    "AAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawA" +
    "AAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAA" +
    "AAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAA" +
    "AAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAA" +
    "AVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABx" +
    "kcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA" +
    "0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUA" +
    "AAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQI" +
    "AAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAA" +
    "AFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGE" +
    "AAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwA" +
    "AABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==";

    //get generated trip code
    $scope.tripCode = await TripService.getTripCode();

    // Get the stop info and count the passengers per stop
    var trip = await TripService.getTrip();
    var boardStops = trip.tripStops.filter( stop => stop.canBoard );
    var passengersByStopId = await TripService.getPassengersByStop();
    _.forEach(passengersByStopId, function(value, key) {
      var stop = boardStops.find(stop => stop.id === +key);
      stop.passengerNumber = value.length;
    });
    $scope.boardStops = boardStops;

    //Start Up the timer to ping GPS location
    PingService.start();
    var GPSOffTimeout;
    $scope.$watch("PingService.lastPingTime", (lastPingTime) => {
      $timeout.cancel(GPSOffTimeout);
      $scope.pingStatus = "GPS ON";
      $scope.pingStatusSymbol = "image/GPSon.svg";
      GPSOffTimeout = $timeout(() => {
        $scope.pingStatus = "GPS OFF";
        $scope.pingStatusSymbol = "image/GPSoff.svg";
      }, 30000);
    });

    // Turn off timers when done with this view
    $scope.$on("$destroy", function() {
      PingService.stop();
      $timeout.cancel(GPSOffTimeout);
    });

    // Prompt to avoid accidental trip ending
    $scope.confirmEndTrip = function() {
      $ionicPopup.confirm({
        title: "Confirm End Trip",
        template: "Are you sure?",
        okType: "button-royal"
      })
      .then(function(response) {
        if (response) {
          $state.go("app.jobEnded",{status: "tripEnded"});
        }
      });
    };

  }];
