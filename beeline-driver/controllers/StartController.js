import _ from "lodash";
export default[
  "$scope",
  "$state",
  "TripService",
  "$ionicPopup",
  "$timeout",
  "$stateParams",
  "PingService",
  async function(
    $scope,
    $state,
    TripService,
    $ionicPopup,
    $timeout,
    $stateParams,
    PingService
  ){
    $scope.data ={
      tripId: $stateParams.tripId || undefined,
    }
    $scope.ping = {
      pingStatus: "GPS OFF",
      pingStatusSymbol: "image/GPSoff.svg"
    }
    console.log($scope.data.tripId);
    //get generated trip code
    $scope.tripCode = await TripService.getTripCode($scope.data.tripId);

    var reloadPassengerTimeout;
    //reload passenger list with ignoreCache=true to update
    //passenger list per stop is updated automatically
    var reloadPassengersList = async function(){
      $timeout.cancel(reloadPassengerTimeout);

      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
      // Get the stop info and count the passengers per stop
      $scope.$apply(async ()=>{
        $scope.data.tripId = $stateParams.tripId;
        $scope.trip = await TripService.getTrip($scope.data.tripId, true);
        $scope.boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );

        //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
        _.forEach($scope.boardStops, function(value, key) {
          value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
        });

        _.forEach(passengersByStopId, function(value, key) {

          var stop = $scope.boardStops.find(stop => stop.id === +key);
          stop.passengerNumber = value.length;
          stop.passengerList = value;
        });
      })

      //every 1 min reload no. of passenger / stop
      reloadPassengerTimeout = $timeout(reloadPassengersList,60000);
    };

    $scope.$on('$ionicView.afterEnter',()=>{
      $scope.data.tripId = $stateParams.tripId;
      console.log("after enter "+$scope.data.tripId);
      PingService.start($scope.data.tripId);
      reloadPassengersList();
    });

    var GPSOffTimeout;

    $scope.$watch(() => PingService.lastPingTime, (lastPingTime) => {
      console.log("ping service last ping time updates");
      $timeout.cancel(GPSOffTimeout);
      $scope.ping.pingStatus = "GPS ON";
      $scope.ping.pingStatusSymbol = "image/GPSon.svg";
      //every 30sec, check status
      GPSOffTimeout = $timeout(() => {
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
      }, 30000);
    });


    // Prompt to avoid accidental trip ending
    $scope.confirmCancelTrip = function() {
      $ionicPopup.confirm({
        title: "Confirm Cancel Trip",
        template: "Are you sure?",
        okType: "button-royal"
      })
      .then(function(response) {
        if (response) {
          $state.go("cancel",{tripId: $scope.data.tripId});
        }
      });
    };

    $scope.stopPing = function() {
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
      PingService.stop();
      $state.go("app.route");
    }

  }];
