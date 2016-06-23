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
  "$ionicHistory",
  "$ionicPlatform",
  "$translate",
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
    $ionicHistory,
    $ionicPlatform,
    $translate
  ){
    $scope.data = {
      routeId: $stateParams.routeId || undefined,
      tripId: $stateParams.tripId || undefined,
      board: true,
      alight: false,
      showBoardPassengerList: false,
      showAlightPassengerList: false,
    }

    //pick up tab is clicked
    $scope.showBoard = function(){
      $scope.data.board = true;
      $scope.data.alight = false;
    }

    //drop off tab is clicked
    $scope.showAlight = function(){
      $scope.data.board = false;
      $scope.data.alight = true;
    }

    var reloadPassengerTimeout;
    var classToggleInterval;
    var GPSTranslations;

    $scope.ping = {
      pingStatus: "GPS BAD",
      pingStatusSymbol: "image/GPSoff.svg",
      isAnimated: true,
      isRedON: true,
    }

    var updatePassengerList = async function(){
      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
      _.forEach(passengersByStopId, function(value, key) {
        var stop = $scope.stops.find(stop => stop.id === +key);
        //wrs user name {name:, email:, telephone:}
        for (let p of value) {
          try {
            let jsonObj = JSON.parse(p.name);
            p.name  = jsonObj.name;
          }catch (err) {
            p.name = p.name;
          }
        }
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
      GPSTranslations = await $translate(['GPS_BAD','GPS_GOOD']);
      //get generated trip code
      TripService.getTripCode($scope.data.tripId)
      .then((tripCode) => $scope.tripCode = tripCode)

      $scope.trip = await TripService.getTrip($scope.data.tripId, true);
      $scope.stops = $scope.trip.tripStops;
      //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
      _.forEach($scope.stops, function(value, key) {
        value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
      });
      reloadPassengersList();

      PingService.start($scope.data.tripId);
      //toggle css class make ping indicator annimation effect
      classToggleInterval = $interval(()=>{
        $scope.ping.isAnimated = !$scope.ping.isAnimated;
      }, 1500);
    });

    var GPSOffTimeout;

    $scope.$watch(() => PingService.lastPingTime, async () => {
      console.log("ping service last ping time updates");
      $timeout.cancel(GPSOffTimeout);
      if (!GPSTranslations) {
        GPSTranslations= await $translate(['GPS_BAD','GPS_GOOD']);
      }
      $scope.ping.pingStatus = GPSTranslations.GPS_GOOD;
      $scope.ping.pingStatusSymbol = "image/GPSon.svg";
      //bring back animation effect
      $scope.ping.isRedON = false;
      //every 20sec, check status
      GPSOffTimeout = $timeout(() => {
        $scope.ping.pingStatus = GPSTranslations.GPS_BAD;
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
        $scope.ping.isRedON = true;
      }, 20000);
    });

    $scope.$watch(() => PingService.gpsError, (error)=>{
      if (error) {
        console.log("Watch error");
        $scope.ping.pingStatus = "GPS OFF";
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
      }
    });

    var confirmPrompt = async function(options) {
      var translations = await $translate(['CANCEL_BUTTON', 'OK_BUTTON']);
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
          { text: translations.CANCEL_BUTTON},
          {
            text: translations.OK_BUTTON,
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
    }

    // Prompt to avoid accidental trip ending
    $scope.confirmCancelTrip = async function() {
      try {

        var translations = await $translate(['ARE_YOU_SURE', 'SLIDE_TO_CANCEL']);
        var promptResponse = await confirmPrompt({
          title: translations.ARE_YOU_SURE,
          subTitle: translations.SLIDE_TO_CANCEL
        });

        if (!promptResponse) return;
        $ionicLoading.show({template: loadingTemplate});
        await TripService.cancelTrip($scope.data.tripId);
        $ionicLoading.hide();
        //cancel has no back view to start
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
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
      var translations = await $translate(['STOP_PING', 'STOP_PING_MSG','CANCEL_BUTTON','OK_BUTTON']);
      var promptResponse = await $ionicPopup.confirm ({
        title: translations.STOP_PING,
        subTitle: translations.STOP_PING_MSG,
        buttons: [
          { text: translations.CANCEL_BUTTON},
          {
            text: translations.OK_BUTTON,
            type: "button-royal",
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
      if (!promptResponse) return;
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
      PingService.stop();
      $state.go("app.route");
    };

    // Triggered when devices with a hardware back button (Android) is clicked by the user
    // This is a Cordova/Phonegap platform specifc method
    function onHardwareBackButton(e) {
      $scope.stopPing();
      e.preventDefault();
      return false;
    };


  }];
