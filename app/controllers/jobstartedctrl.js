'use strict';

var JobStartedController =[
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
}];
