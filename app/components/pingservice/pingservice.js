'use strict';

angular.module('myApp.pingservice', [

])

.service('PingService', function ($http) {
    var self = this;
    var latlng = [1.38, 103.8];
   
    console.log('Starting ping post');
    window.setInterval(function () {
        self.setPing(2)
    }, 10000);


    this.setPing = function(id) {
        latlng[0] += Math.random() * 0.005 - 0.0025
        latlng[1] += Math.random() * 0.005 - 0.0025
        
        
      var url="http://localhost:8080/trips/"+id+"/pings";
      var data={
          "vehicleId":2,
           latitude: latlng[0],
           longitude: latlng[1]
       };
      var config ={
          headers: {
              "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY',
              "Content-Type": 'application/json' 
          }
      };
      $http.post(url,data,config).then(function(response){
          console.log(response.status);
      })
 
    };      
    
    
    this.getPing = function(id){
        return $http.get("http://localhost:8080/trips/"+id+"/pings?limit=5", {
        headers: {
          "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY'
        }
      })
    }

    
});