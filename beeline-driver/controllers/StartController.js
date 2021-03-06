import _ from "lodash";
// import confirmPromptTemplate from "../templates/confirm-prompt.html";
import loadingTemplate from "../templates/loading.html";
import querystring from 'querystring'
import polyline from '@mapbox/polyline'

export default[
  "$scope","$state","TripService","$ionicPopup","$timeout","$stateParams",
  "PingService","$ionicLoading","$rootScope","VerifiedPromptService",
  "$ionicHistory","$ionicPlatform","$translate","$ionicScrollDelegate",
  function(
    $scope,$state,TripService,$ionicPopup,$timeout,$stateParams,
    PingService,$ionicLoading,$rootScope,VerifiedPromptService,
    $ionicHistory,$ionicPlatform,$translate,$ionicScrollDelegate
  ){
    $scope.data = {
      routeId: $stateParams.routeId || undefined,
      tripId: $stateParams.tripId || undefined,
      currentList: 'board',
    }
    $scope.googleMapsNavigationUrl = null

    var reloadPassengerTimeout;
    var classToggleTimeout;
    var GPSTranslations;


    var gpsTranslationPromise = $translate(['GPS_BAD','GPS_GOOD']);

    var updatePassengerList = async function(){
      var passengersByStopId = await TripService.getPassengersByStop($scope.data.tripId, true);
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

      $scope.boardStops = $scope.trip.tripStops.filter( stop => stop.canBoard );
      $scope.boardStops = _.sortBy($scope.boardStops, function(item){
        return item.time;
      });
      //stop can be both canBoard and canAlight??
      $scope.alightStops = $scope.trip.tripStops.filter( stop => stop.canAlight );
      $scope.alightStops = _.sortBy($scope.alightStops, function(item){
        return item.time;
      });

      computeNavigationUrls()
    }

    /**
     * Augments each item in the `tripStops` property with a `googleMapsNavigationURL` property.
     *
     * The navigation URL will add a waypoint to ensure the correct direction of approach, provided
     * such information can be derived from the `path` property.
     */
    async function computeNavigationUrls () {
      const tripStops = _.sortBy($scope.trip.tripStops, 'time')
      const latLngOfStop = tripStop => `${tripStop.stop.coordinates.coordinates[1]},${tripStop.stop.coordinates.coordinates[0]}`
      const route = await TripService.getRoute($scope.data.routeId)
      const path = route && polyline.decode(route.path).map(([a, b]) => [b, a])

      /**
       * Navigation from driver's current location to stop
       * @param {TripStop} tripStop
       */
      function simpleNavigationURL(tripStop) {
        return `https://www.google.com/maps/dir/?api=1&` + querystring.stringify({
          destination: latLngOfStop(tripStop),
          travelmode: 'driving',
        })
      }

      /**
       * Navigation from driver's current location, to the point in the path just before the trip stop,
       * then onward to the trip stop.
       *
       * This relies on route.path being accurate.
       *
       * @param {TripStop} tripStop
       * @param {TripStop} prevTripStop
       */
      function waypointedNavigationURL(tripStop, prevTripStop) {
        const nearestPathPointToPrev = _(path)
          .map((value, index) => // [latlng], index, distance
            [value, index, roughLngLatDistance(value, prevTripStop.stop.coordinates.coordinates)])
          .filter(v => v[2] < 400)
          .minBy(v => v[2])

        const nearestPathPointToCurrent = _(path)
          .map((value, index) => // [latlng], index, distance
            [value, index, roughLngLatDistance(value, tripStop.stop.coordinates.coordinates)])
          .filter(v => v[2] < 400)
          .minBy(v => v[2])

        // This condition will be true, e.g. if the path does not correspond to the actual trip stops
        // in the list
        if (!nearestPathPointToPrev || !nearestPathPointToCurrent || (prevTripStopIndex > tripStopIndex)) {
          return simpleNavigationURL(tripStop)
        }

        const prevTripStopIndex = nearestPathPointToPrev[1]
        const tripStopIndex = nearestPathPointToCurrent[1]

        const waypointCoords = path[tripStopIndex - 1]

        if (!waypointCoords) {
          return simpleNavigationURL(tripStop)
        }

        return `https://www.google.com/maps/dir/?api=1&` + querystring.stringify({
          destination: latLngOfStop(tripStop),
          waypoints: `${waypointCoords[1]},${waypointCoords[0]}`,
          travelmode: 'driving',
        })
      }

      tripStops.forEach((tripStop, index) => {
        if (index === 0 || !path) {
          tripStop.googleMapsNavigationUrl = simpleNavigationURL(tripStop)
        } else {
          tripStop.googleMapsNavigationUrl = waypointedNavigationURL(tripStop, tripStops[index - 1])
        }
      })
    }

    //reload passenger list with ignoreCache=true to update
    //passenger list per stop is updated automatically
    var reloadPassengersList = function(){
      $timeout.cancel(reloadPassengerTimeout);
      updatePassengerList();
      //every 1 min reload no. of passenger / stop
      reloadPassengerTimeout = $timeout(reloadPassengersList,60000);
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
      //without resize, 'stop trip' button not shown when viewing 'drop off' stops
      $ionicScrollDelegate.resize();
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

    // var confirmPrompt = async function(options) {
    //   var translations = await $translate(['CANCEL_BUTTON', 'OK_BUTTON']);
    //   var promptScope = $rootScope.$new(true);
    //   promptScope.data = {
    //     toggle: false
    //   };
    //   _.defaultsDeep(options,{
    //     template: confirmPromptTemplate,
    //     title: "",
    //     subTitle: "",
    //     scope: promptScope,
    //     buttons: [
    //       { text: translations.CANCEL_BUTTON},
    //       {
    //         text: translations.OK_BUTTON,
    //         type: "button-royal",
    //         onTap: function(e) {
    //           if (promptScope.data.toggle){
    //             return true;
    //           }
    //           e.preventDefault();
    //         }
    //       }
    //     ]
    //   });
    //   return $ionicPopup.show(options);
    // }

    // Prompt to avoid accidental trip ending
    // $scope.confirmCancelTrip = async function() {
    //   try {
    //
    //     var translations = await $translate(['ARE_YOU_SURE', 'SLIDE_TO_CANCEL', 'ERROR_CANCEL_TRIP']);
    //     var promptResponse = await confirmPrompt({
    //       title: translations.ARE_YOU_SURE,
    //       subTitle: translations.SLIDE_TO_CANCEL
    //     });
    //
    //     if (!promptResponse) return;
    //     try {
    //       $ionicLoading.show({template: loadingTemplate});
    //       await TripService.cancelTrip($scope.data.tripId);
    //     } catch (e) {
    //       throw e;
    //     } finally {
    //       $ionicLoading.hide();
    //     }
    //     stopPingandInterval();
    //     //cancel has no back view to start
    //     $ionicHistory.nextViewOptions({
    //       disableBack: true
    //     });
    //     $state.go("cancel",{routeId: $scope.data.routeId, tripId: $scope.data.tripId});
    //
    //   }
    //   catch(error){
    //     VerifiedPromptService.alert({
    //       title: translations.ERROR_CANCEL_TRIP,
    //       subTitle: `${error.status} - ${error.message}`
    //     });
    //   }
    // };

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

    $scope.openExternalUrl = function ($event, url) {
      $event.preventDefault()
      window.open(url, '_system')
    }

    //when leave this view, stop the ping service and remove timeouts
    var stopPingandInterval = function (){
      $timeout.cancel(GPSOffTimeout);
      $timeout.cancel(reloadPassengerTimeout);
      $timeout.cancel(classToggleTimeout);
      PingService.stop();
    }

    function roughLngLatDistance(a, b) {
      const latDiffRadians = (b[1] - a[1]) / 180 * Math.PI
      const lngDiffRadians = (b[0] - a[0]) / 180 * Math.PI

      const avgLatRadians = 0.5 * (a[1] + b[1]) / 180 * Math.PI

      const diffEW = lngDiffRadians * 6371e3 * Math.cos(avgLatRadians)
      const diffNS = latDiffRadians * 6371e3

      return Math.sqrt(diffEW * diffEW + diffNS * diffNS)
    }

    // Triggered when devices with a hardware back button (Android) is clicked by the user
    // This is a Cordova/Phonegap platform specifc method
    function onHardwareBackButton(e) {
      e.preventDefault();
      $scope.stopPing();
      return false;
    };
  }];