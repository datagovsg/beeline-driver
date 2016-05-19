import _ from "lodash";
export default[
  "$scope",
  "$state",
  "TripService",
  "$ionicPopup",
  "TokenService",
  "PingService",
  "$timeout",
  "$rootScope",
  async function(
    $scope,
    $state,
    TripService,
    $ionicPopup,
    TokenService,
    PingService,
    $timeout,
    $rootScope
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

    var GPSOffTimeout;

    $scope.$watch(() => PingService.lastPingTime, (lastPingTime) => {
      $timeout.cancel(GPSOffTimeout);
      $scope.pingStatus = "GPS ON";
      $scope.pingStatusSymbol = "image/GPSon.svg";
      GPSOffTimeout = $timeout(() => {
        $scope.pingStatus = "GPS OFF";
        $scope.pingStatusSymbol = "image/GPSoff.svg";
      }, 30000);
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

    var reloadPassengerTimeout;
    //reload passenger list with ignoreCache=true to update
    //passenger list per stop is updated automatically
    var reloadPassengersList = async function(){
      $timeout.cancel(reloadPassengerTimeout);
      var passengersByStopId = await TripService.getPassengersByStop(true);

      _.forEach(passengersByStopId, function(value, key) {
        var stop = boardStops.find(stop => stop.id === +key);
        stop.passengerNumber = value.length;
      });
      $scope.$apply(()=>{
        $scope.boardStops = boardStops;
      });

      reloadPassengerTimeout = $timeout(reloadPassengersList,60000);
    };

    //1st time run
    reloadPassengersList();

    $scope.$on('$ionicView.afterEnter',()=>{
      reloadPassengersList();
    });

    $scope.$on("$ionicView.leave", function() {
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
    });

  }];
