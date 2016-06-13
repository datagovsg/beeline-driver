import _ from "lodash";
export default[
  "$scope",
  "$state",
  "TripService",
  "$ionicPopup",
  "$timeout",
  "$rootScope",
  '$stateParams',
  async function(
    $scope,
    $state,
    TripService,
    $ionicPopup,
    $timeout,
    $rootScope,
    $stateParams
  ){
    $scope.data ={
      tripId: $stateParams.tripId || undefined,
    }
    console.log($scope.data.tripId);
    //get generated trip code
    $scope.tripCode = await TripService.getTripCode($scope.data.tripId);

    // Get the stop info and count the passengers per stop
    $scope.trip = await TripService.getTrip($scope.data.tripId, true);
    $scope.boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );

    //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
    _.forEach($scope.boardStops, function(value, key) {
      value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
    });

    var GPSOffTimeout;

    // $scope.$watch(() => PingService.lastPingTime, (lastPingTime) => {
    //   $timeout.cancel(GPSOffTimeout);
    //   $scope.pingStatus = "GPS ON";
    //   $scope.pingStatusSymbol = "image/GPSon.svg";
    //   GPSOffTimeout = $timeout(() => {
    //     $scope.pingStatus = "GPS OFF";
    //     $scope.pingStatusSymbol = "image/GPSoff.svg";
    //   }, 30000);
    // });


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

      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);

      var boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );

      _.forEach(passengersByStopId, function(value, key) {

        var stop = boardStops.find(stop => stop.id === +key);
        stop.passengerNumber = value.length;
        stop.passengerList = value;
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

    $scope.showPassengerList = function(stopId) {
      $state.go("passengerList",{
        tripId: $scope.data.tripId,
        stopId: stopId
      })
    }

  }];
