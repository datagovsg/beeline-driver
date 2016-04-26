'use strict';

export default[
  '$scope',
  '$state',
  '$interval',
  'DriverService',
  'TripService',
  'uiGmapGoogleMapApi',
  function(
    $scope,
    $state,
    $interval,
    DriverService,
    TripService,
    uiGmapGoogleMapApi
  ){

    //Gmap default settings
    $scope.map = {
      center: { latitude: 1.370244, longitude: 103.823315 },
      zoom: 10,
      bounds: { //so that autocomplete will mainly search within Singapore
        northeast: {
          latitude: 1.485152,
          longitude: 104.091837
        },
        southwest: {
          latitude: 1.205764,
          longitude: 103.589899
        }
      },
      dragging: true,
      control: {},
      options: {
        disableDefaultUI: true,
        styles: [{
          featureType: "poi",
          stylers: [{
            visibility: "off"
          }]
        }],
        draggable: true
      },
      markers: [],
      lines: [{
        id: 'routepath',
        path: [],
        icons: [{
          icon: {
            path: 1,
            scale: 3,
            strokeColor: '#333'
          },
          offset: '20%',
          repeat: '50px'
        }]
      }]
    };

    $scope.job = {
      path: '',
      tripNumber: '',
      startTime: '',
      startLocation: '',
      endTime: '',
      endLocation: '',
      acceptoff: false,
    };

    //timer-specific values
    $scope.timer = {
      currentDateTime: '',
      finalDateTime: '',
      timeleft: 0,
      timerstarted: false,
      hh: 0,
      mm: 0,
      ss: 0,
      tick: function() {
        console.log(this.timeleft);
        this.timeleft -= 1000;
      }
    }

    function updateHHMMSS(secondsLeft) {
      var hh = parseInt(secondsLeft/1000/60/60);
      var mm = parseInt((secondsLeft-hh*1000*60*60)/1000/60);
      var ss = Math.floor((secondsLeft-hh*1000*60*60-mm*1000*60)/1000);
      $scope.timer.hh = hh;
      $scope.timer.mm = mm;
      $scope.timer.ss = ss;
    };

    var countdownTimer;
    var tripData = DriverService.getDecodedToken();

    $scope.fillInTripRouteData = function() {
//re-organise the DB output into Google Map compatible JSON
      var pathTemp = [];
      for (var i = 0; i < TripService.routepath.path.length; i++) {
        pathTemp.push({
          latitude: TripService.routepath.path[i].lat,
          longitude: TripService.routepath.path[i].lng
        });
      }

//Need to fix the API to give discrete names for start and end locations
      var routeStartEnd = TripService.routepath.description.split(' to ');
      var tripStops = TripService.trip.tripStops;
      var startTimeObj = new Date(tripStops[0].time);
      var endTimeObj = new Date(tripStops[tripStops.length-1].time);

      $scope.job.path = pathTemp;
      $scope.job.startLocation = routeStartEnd[0];
      $scope.job.endLocation = routeStartEnd[1];
      $scope.job.startTime = startTimeObj.getTime()
      $scope.job.endTime = endTimeObj.getTime()

      $scope.map.lines[0].path = $scope.job.path;
    };

    $scope.initTimer = function() {
//HARDCODE test value
      $scope.timer.currentDateTime = $scope.job.startTime - 1800000;
      $scope.timer.firstStopDateTime = $scope.job.startTime;

      /* ----- FOR TESTING ----- */
      //var e = new Date($scope.job.startTime);
      //console.log(e.getFullYear() + '-' + (e.getMonth()+1) + '-' + e.getDate() + ' ' + e.getHours() + ':' + e.getMinutes() + ':' + e.getSeconds());
      /* ----- ----- ----- ----- */

      var secsToEnd = $scope.timer.firstStopDateTime - $scope.timer.currentDateTime;
      if (secsToEnd > 0) { //time remaining - display yellow button with countdown
        $scope.timer.timeleft = secsToEnd;

        //Init the timer
        updateHHMMSS($scope.timer.timeleft);

        //Timer starts the moment the user enters the page
        if ($scope.timer.timerstarted == false)
        {
          $scope.timer.timerstarted = true;

          //Countdown timer
          countdownTimer = $interval(function(){
            $scope.timer.tick();
            updateHHMMSS($scope.timer.timeleft);

            if ($scope.timer.timeleft <= 0) //kill the timer + disable button
            {
              $scope.job.acceptoff = true;
              $interval.cancel(timer);
            }
          }, 1000);
        }
      }
      else { //time expired - disable button
        $scope.job.acceptoff = true;
      }
    };

    $scope.acceptTheJob = function() {
      if ($scope.job.acceptoff != true)
      {
        $state.go('app.jobAccepted');

        //call the API that will update the DB to indicate the driver has taken the job
//FIX ME
      }
    }

    $scope.$on('$ionicView.leave',()=>{
      $interval.cancel(countdownTimer);
    });

    //Grab Trip and Route info
    if (typeof(tripData) != 'undefined') {
      TripService.getTrip(tripData.tripId).then(function(){ //grab trip info
        console.log(TripService.trip);
        $scope.job.tripNumber = TripService.trip.id;

        return TripService.getRoutePath(TripService.trip.routeId);
      }).then(function() { //grab route info

        //populate $scope.job with the relevant data
        $scope.fillInTripRouteData();

        //Now that we got the route info, let's start up the timer
        $scope.initTimer();

        return uiGmapGoogleMapApi;
      }).then(function(googleMaps) {
        var gmap = $scope.map.control.getGMap();

        //console.log(gmap);
      }); //end Promise
    }
  }];
