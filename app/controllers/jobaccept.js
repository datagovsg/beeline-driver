'use strict';

var JobAcceptController =[
    '$scope',
    '$state',
function(
    $scope,
    $state
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
		mapControl: {},
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
		tripnum: 'B21',
		stime: '7.28am',
		sroad: 'Punggol Central',
		eroad: 'Anson Road',
		acceptlimit: 30*1000*60, //5 min
		timeleft: 0,
		timerstarted: false,
		acceptoff: false,
        hh: 0,
        mm: 0,
        ss: 0
	};
    //reset timeleft to acceptlimit at first
    $scope.job.timeleft = $scope.job.acceptlimit;

    var updateHHMMSS = function(timeleft) {
        var hh = parseInt(timeleft/1000/60/60);
        var mm = parseInt((timeleft-hh*1000*60*60)/1000/60);
        var ss = (timeleft-hh*1000*60*60-mm*1000*60)/1000;
        $scope.job.hh = hh;
        $scope.job.mm = mm;
        $scope.job.ss = ss;
    };

    updateHHMMSS($scope.job.timeleft);

	$scope.updateTimer = function() {
		console.log($scope.job.timeleft);
        $scope.job.timeleft -= 1000;
		return $scope.job.timeleft;
	}

	//Timer starts the moment the user enters the page
	if ($scope.job.timerstarted == false)
	{
		$scope.job.timerstarted = true;

		var timer = setInterval(function(){
			var timeLeft = $scope.updateTimer();

            $scope.$apply(function(){
                updateHHMMSS($scope.job.timeleft);
            });

			if (timeLeft <= 0) //kill the timer + disable button
			{
				$scope.$apply(function(){
					$scope.job.acceptoff = true;
				});
				clearInterval(timer);
			}
		}, 1000);
	}

    $scope.accept = function() {
        console.log("clicked");
        $state.go('jobAccepted');
    }

    $scope.$on("$destroy", function() {
         if (timer) {
             clearInterval(timer);
         }
     });

}];
