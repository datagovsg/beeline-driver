"use strict";

export default[
  "$scope",
  function(
    $scope
  ){
    $scope.updatedCarplateNo = null;
    $scope.input = false;
    $scope.$watch("updatedCarplateNo", function() {
      if ($scope.updatedCarplateNo != null) {
        $scope.input = true;
      }
    });

    $scope.loadFile = function(event) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = function(event){
        var output = document.getElementById("output");
        output.src = event.target.result;
      };
    };
  }];
