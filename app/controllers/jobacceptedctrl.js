'use strict';

var JobAcceptedController =[
    '$scope',
    '$state',
function(
    $scope,
    $state
){
	//Gmap default settings
	$scope.job = {
		tripnum: 'B21',
		stime: '7.28am',
		sroad: 'Punggol Central',
		eroad: 'Anson Road'
	};

    $scope.startJob = function() {
        $state.go('jobStarted');        
    }
}];
