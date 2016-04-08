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
    tripNumber: 'B21',
    startTime: '7.28am',
    startRoad: 'Punggol Central',
    endRoad: 'Anson Road'
  };
}];

var loadFile = function(event) {
  var reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onload = function(){
    var output = document.getElementById('output');
    output.src = reader.result;
  };
};
