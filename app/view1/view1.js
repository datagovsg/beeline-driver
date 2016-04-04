'use strict';

angular.module('myApp.view1', ['ngRoute',
                               'myApp.driverservice',
                               'uiGmapgoogle-maps',
                               'myApp.pingservice'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/TripInfor', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.config(function (uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    //client: 'gme-infocommunications',
    key: 'AIzaSyBpcW5fbQHwDrJQGl3F5bB9ZgbGERczPDo', //free one
    libraries: 'places'
  });
})

.controller('View1Ctrl', function($scope, $interval,DriverService, uiGmapGoogleMapApi, PingService) {
    console.log('Starting ping get');
    var intervalPromise = $interval(function () { 
        PingService.getPing(2).then(function(response){
            $scope.pings = response.data;
            console.log($scope.pings);
        })
    }, 10000);
    
    
    $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
            console.log('stoping ping get');
        });
    
    
    DriverService.get(2).then(function (){
       $scope.driver =  DriverService.driver;
    });
    
    $scope.map = {
        center: { latitude: 1.370244, longitude: 103.823315 },
        zoom: 12,
        mapControl: {},
        events: {
            idle: function idle() {} //empty function - to be overwritten
        },
        options: {
            disableDefaultUI: true,
            styles: [{
                featureType: "poi",
                stylers: [{
                    visibility: "off"
                }]
            }]
        }
    }; 
    
    uiGmapGoogleMapApi.then(function (map) {
        console.log("success");
        $scope.pingMarkerOptions = {
            icon: {
                url: 'img/board.png',
                scaledSize: new google.maps.Size(20,20),
                anchor: new google.maps.Point(5,5),
            },
        };
    });   
    
});

var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};



