'use strict';

var UpdateBusController =[
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

var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};
