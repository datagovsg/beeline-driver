import _ from "lodash";
import confirmPromptTemplate from "../templates/confirm-prompt.html";
import loadingTemplate from "../templates/loading.html";
export default[
  "$scope", "$state", "TripService", "$ionicPopup", "$timeout", "$stateParams",
  "PingService", "$ionicLoading", "$rootScope", "VerifiedPromptService",
  "$ionicHistory", "$ionicPlatform", "$translate", "SpeechService",
  function(
    $scope, $state, TripService, $ionicPopup, $timeout, $stateParams,
    PingService, $ionicLoading, $rootScope, VerifiedPromptService,
    $ionicHistory, $ionicPlatform, $translate, SpeechService
  ){
    $scope.data = {
      routeId: $stateParams.routeId || undefined,
      tripId: $stateParams.tripId || undefined,
      currentList: 'board',
    }

    var reloadPassengerTimeout;
    var classToggleTimeout;
    var GPSTranslations;


    var gpsTranslationPromise = $translate(['GPS_BAD','GPS_GOOD']);

    var updatePassengerList = async function(){
      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);

      var passengerListBefore = _.cloneDeep($scope.stops);

      _.forEach(passengersByStopId, function(value, key) {
        var stop = $scope.stops.find(stop => stop.id === +key);
        //wrs user name {name:, email:, telephone:}
        for (let passsenger of value) {
          try {
            let jsonObj = JSON.parse(passsenger.name);
            passsenger.name  = jsonObj.name;
          }catch (err) {
            passsenger.name = passsenger.name;
          }
        }
        stop.passengerCount = value.length;
        stop.passengerList = value;
      });

      if (passengerListBefore) {
        SpeechService.announcePassengerListDifferences($scope.stops, passengerListBefore)
      }

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
      reloadPassengerTimeout = $timeout(reloadPassengersList,20000);
    };

    //toggle css class make ping indicator annimation effect
    function togglePulse() {
      if ($scope.ping.isAnimated) {
        // Starts big, ends small
        $scope.ping.isAnimated = false;
        classToggleTimeout = $timeout(togglePulse, 1200)
      }
      else {
        $scope.ping.isAnimated = true;
        classToggleTimeout = $timeout(togglePulse, 300);
      }
    }

    function locationChanged(position) {
      SpeechService.announceGeoFence($scope.stops, position);
    }

    var deregister;
    $scope.$on('$ionicView.enter', async () => {
      $scope.ping = {
        pingStatus: "GPS BAD",
        pingStatusSymbol: "image/GPSoff.svg",
        isAnimated: false,
        isRedON: true,
      }
      $scope.data.routeId = $stateParams.routeId;
      $scope.data.tripId = $stateParams.tripId;
      $scope.data.routeDescription = await TripService.getRouteDescription($scope.data.routeId);
      //get generated trip code
      TripService.getTripCode($scope.data.tripId)
      .then((tripCode) => $scope.tripCode = tripCode);

      PingService.start($scope.data.tripId);
      PingService.events.on('locationChanged', locationChanged);

      togglePulse();
      $scope.trip = await TripService.getTrip($scope.data.tripId, true);
      $scope.stops = $scope.trip.tripStops;
      //stop description e.g. "Yishun 1, Yishun Road 1, RandomPoint, ID 333331"
      _.forEach($scope.stops, function(value, key) {
        value.stopDescription = value.stop.description + ", " + value.stop.road+ ", " + value.stop.type+ ", ID " + value.stop.label;
      });
      reloadPassengersList();

      //override hardware back button, 101 is priority higher than go to back view
      deregister = $ionicPlatform.registerBackButtonAction(
        onHardwareBackButton,101
      );
    });

    //deregister the back button event handler
    $scope.$on('$ionicView.beforeLeave', () => deregister());

    var GPSOffTimeout;

    $scope.$watch(() => PingService.lastPingTime, async () => {
      GPSTranslations= await gpsTranslationPromise;
      if (PingService.lastPingTime !== undefined) {
        $timeout.cancel(GPSOffTimeout);
        $scope.ping.pingStatus = GPSTranslations.GPS_GOOD;
        $scope.ping.pingStatusSymbol = "image/GPSon.svg";
        //bring back animation effect
        $scope.ping.isRedON = false;
      }
      GPSOffTimeout = $timeout(() => {
        $scope.ping.pingStatus = GPSTranslations.GPS_BAD;
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
        $scope.ping.isRedON = true;
      }, 20000);
    });

    $scope.$watch(() => PingService.gpsError, async (error) => {
      if (error) {
        GPSTranslations= await gpsTranslationPromise;
        $scope.ping.pingStatus = GPSTranslations.GPS_BAD;
        $scope.ping.pingStatusSymbol = "image/GPSoff.svg";
        $scope.ping.isRedON = true;
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

        var translations = await $translate(['ARE_YOU_SURE', 'SLIDE_TO_CANCEL', 'ERROR_CANCEL_TRIP']);
        var promptResponse = await confirmPrompt({
          title: translations.ARE_YOU_SURE,
          subTitle: translations.SLIDE_TO_CANCEL
        });

        if (!promptResponse) return;
        try {
          $ionicLoading.show({template: loadingTemplate});
          await TripService.cancelTrip($scope.data.tripId);
        } catch (e) {
          throw e;
        } finally {
          $ionicLoading.hide();
        }
        stopPingandInterval();
        //cancel has no back view to start
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("cancel",{routeId: $scope.data.routeId, tripId: $scope.data.tripId});

      }
      catch(error){
        VerifiedPromptService.alert({
          title: translations.ERROR_CANCEL_TRIP,
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
      stopPingandInterval();
      $state.go("app.route");
    };

    //when leave this view, stop the ping service and remove timeouts
    var stopPingandInterval = function (){
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
      $timeout.cancel(classToggleTimeout);
      PingService.stop();
      PingService.events.removeListener('locationChanged', locationChanged);
    }

    // Triggered when devices with a hardware back button (Android) is clicked by the user
    // This is a Cordova/Phonegap platform specifc method
    function onHardwareBackButton(e) {
      e.preventDefault();
      $scope.stopPing();
      return false;
    };

  }];
