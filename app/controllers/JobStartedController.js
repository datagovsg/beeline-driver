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
    tripNumber: 'B21',
    startTime: '7.28am',
    startRoad: 'Punggol Central',
    endRoad: 'Anson Road'
  };
}];
