'use strict';

var EmergencyController =[
    '$scope',
    '$state', 
function(
    $scope,
    $state
){
	//toggles the Open/Close of the Emergency panel
	$scope.toggleEmerg = function() {
		var stub = document.getElementById('stub');
		var emerg = document.getElementById('emerg');
		var close = document.getElementById('emergclose');

		if (angular.element(stub).hasClass('hide'))
		{
			angular.element(stub).removeClass('hide');
			angular.element(emerg).removeClass('hide');
		}
		else
		{
			angular.element(stub).addClass('hide');
			angular.element(emerg).addClass('hide');
		}
	}
}];
