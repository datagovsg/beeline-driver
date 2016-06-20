import _ from "lodash";
import confirmPromptTemplate from "../templates/confirm-prompt.html";
import loadingTemplate from "../templates/loading.html";
export default[
  "$scope",
  "$state",
  "TripService",
  "$ionicPopup",
  "$timeout",
  "$stateParams",
  "PingService",
  "$ionicLoading",
  "$rootScope",
  "VerifiedPromptService",
  function(
    $scope,
    $state,
    TripService,
    $ionicPopup,
    $timeout,
    $stateParams,
    PingService,
    $ionicLoading,
    $rootScope,
    VerifiedPromptService
  ){
    $scope.data ={
      routeId: $stateParams.routeId || undefined,
      tripId: $stateParams.tripId || undefined,
      imageClass: true
    }

    $scope.ping = {
      pingStatus: "GPS OFF",
      pingStatusSymbol: "image/GPSoff.svg"
    }
    //get generated trip code
    TripService.getTripCode($scope.data.tripId)
    .then((tripCode) => $scope.tripCode = tripCode)

    var reloadPassengerTimeout;
    //reload passenger list with ignoreCache=true to update
    //passenger list per stop is updated automatically
    var reloadPassengersList = function(){
      $timeout.cancel(reloadPassengerTimeout);

      // Get the stop info and count the passengers per stop
      $scope.$apply(async ()=>{
        var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
        _.forEach(passengersByStopId, function(value, key) {
          var stop = $scope.boardStops.find(stop => stop.id === +key);
          stop.passengerNumber = value.length;
          stop.passengerList = value;
        });
      })

      //every 1 min reload no. of passenger / stop
      reloadPassengerTimeout = $timeout(reloadPassengersList,60000);
    };

    $scope.$on('$ionicView.enter', async () => {
      $scope.data.tripId = $stateParams.tripId;
      console.log("before enter "+$scope.data.tripId);

      $scope.trip = await TripService.getTrip($scope.data.tripId, true);
      $scope.boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );
      //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
      _.forEach($scope.boardStops, function(value, key) {
        value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
      });
      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
      _.forEach(passengersByStopId, function(value, key) {
        var stop = $scope.boardStops.find(stop => stop.id === +key);
        stop.passengerNumber = value.length;
        stop.passengerList = value;
      });

      $scope.$apply();

      reloadPassengersList();
      PingService.start($scope.data.tripId);
      //toggle css class make ping indicator annimation effect
      classToggleInterval = $interval(()=>{
        $scope.data.imageClass = !$scope.data.imageClass;
      }, 1500);

    })


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
      }, 20000);
    });

    $scope.$watch(() => PingService.error, (error)=>{
      if (error) {
        console.log("Watch error");
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
      }
    });

    var confirmPrompt = function(options) {
      var promptScope = $rootScope.$new(true);
      promptScope.data = {
        toggle: false
      };
      _.defaultsDeep(options,{
        template: confirmPromptTemplate,
        title: "",
        subTitle: "",
        scope: promptScope,
        buttons: [
          { text: "Cancel"},
          {
            text: "OK",
            type: "button-royal",
            onTap: function(e) {
              if (promptScope.data.toggle){
                return true;
              }
              e.preventDefault();
            }
          }
        ]
      });
      return $ionicPopup.show(options);
    };

    // Prompt to avoid accidental trip ending
    $scope.confirmCancelTrip = async function() {
      try {
        var promptResponse = await confirmPrompt({
          title: "Are you sure?",
          subTitle: "Slide to cancel trip. This will notify the passsengers and ops."
        });
        if (!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        await TripService.cancelTrip($scope.data.tripId);
        $ionicLoading.hide();
        $state.go("cancel",{routeId: $scope.data.routeId, tripId: $scope.data.tripId});
      }
      catch(error){
        $ionicLoading.hide();
        VerifiedPromptService.alert({
          title: "There was an error cancelling trip. Please try again.",
          subTitle: `${error.status} - ${error.message}`

        });
      }
    };

    $scope.stopPing = async function() {
      var promptResponse = await $ionicPopup.confirm ({
        title: "Stop Ping",
        subTitle: "Are you sure you want to stop pinging?",
        okType: "button-royal"
      });
      if (!promptResponse) return;
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
      PingService.stop();
      $state.go("app.route");
    }

  }];
