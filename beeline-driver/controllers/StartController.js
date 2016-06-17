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
  "$interval",
  "$ionicModal",
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
    VerifiedPromptService,
    $interval,
    $ionicModal
  ){
    $scope.data ={
      routeId: $stateParams.routeId || undefined,
      tripId: $stateParams.tripId || undefined,
      board: true,
      alight: false,
      showBoardPassengerList: false,
      showAlightPassengerList: false,
      imageClass: true,
      toggle: false
    }

    $scope.showBoard = function(){
      $scope.data.board = true;
      $scope.data.alight = false;
      $scope.data.showBoardPassengerList=false;
      $scope.data.showAlightPassengerList=false;
    }

    $scope.showAlight = function(){
      $scope.data.board = false;
      $scope.data.alight = true;
      $scope.data.showBoardPassengerList=false;
      $scope.data.showAlightPassengerList=false;
    }

    $scope.ping = {
      pingStatus: "GPS OFF",
      pingStatusSymbol: "image/GPSoff.svg"
    }

    //get generated trip code
    TripService.getTripCode($scope.data.tripId)
    .then((tripCode) => $scope.tripCode = tripCode)

    var reloadPassengerTimeout;
    var classToggleInterval;
    //reload passenger list with ignoreCache=true to update
    //passenger list per stop is updated automatically
    var reloadPassengersList = function(){
      $timeout.cancel(reloadPassengerTimeout);
      updatePassengerList();
      //every 1 min reload no. of passenger / stop
      reloadPassengerTimeout = $timeout(reloadPassengersList,60000);
    };

    $scope.$on('$ionicView.enter', async () => {
      $scope.data.tripId = $stateParams.tripId;
      console.log("before enter "+$scope.data.tripId);
      $scope.trip = await TripService.getTrip($scope.data.tripId, true);
      $scope.stops = $scope.trip.tripStops;
      //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
      _.forEach($scope.stops, function(value, key) {
        value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
      });
      updatePassengerList();
      reloadPassengersList();
      PingService.start($scope.data.tripId);
      classToggleInterval = $interval(()=>{
        $scope.data.imageClass = !$scope.data.imageClass;
      }, 1500);
    });

    var updatePassengerList = async function(){
      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
      _.forEach(passengersByStopId, function(value, key) {
        var stop = $scope.stops.find(stop => stop.id === +key);
        stop.passengerNumber = value.length;
        stop.passengerList = value;
      });

      $scope.boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );
      $scope.boardStops = _.sortBy($scope.boardStops, function(item){
        return item.time;
      });
      //stop can be both canBoard and canAlight??
      $scope.alightStops = $scope.trip.tripStops.filter( stop => stop.canAlight );
      $scope.alightStops = _.sortBy($scope.alightStops, function(item){
        return item.time;
      });
    }


    var GPSOffTimeout;

    $scope.$watch(() => PingService.lastPingTime, () => {
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

    $scope.modal = $ionicModal.fromTemplate(confirmPromptTemplate, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    $scope.toggleClick = function() {
      $scope.modal.hide()
      if ($scope.data.toggle) {
        this.confirmCancelTrip();
      }
    };

    // Prompt to avoid accidental trip ending
    $scope.confirmCancelTrip = async function() {
      try {
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
      $interval.cancel(classToggleInterval);
      PingService.stop();
      $state.go("app.route");
    }

    $scope.$on('$destroy', () => {
      if ($scope.modal) {
        $scope.modal.remove();
      }
    });

  }];
