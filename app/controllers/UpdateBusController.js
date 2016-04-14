'use strict';

export default[
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

    $scope.loadFile = function(event) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = function(event){
        var output = document.getElementById('output');
        output.src = event.target.result;
      };
    };
  }];
