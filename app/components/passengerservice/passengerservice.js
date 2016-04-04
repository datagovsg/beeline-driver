'use strict';

angular.module('myApp.passengerservice', [

])

.service('PassengerService', function ($http, $filter) {
    var passengers = [];
    var stops=[];
    var boardstops=[];
    var passengerbystops = [];
    var self = this;
    
    this.loadData = function(tripId) {
        var passsengerDataPromise = $http
        .get("http://localhost:8080/trips/" + tripId + "/get_passengers", {
            headers: {
                "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY'
            }
        })
        .then(function (response) {
            self.passengerData = response.data;
            // group by 
            self.passengersByStop = _.groupBy(self.passengerData,
                                psg => psg.boardStopId);
        })
        ;
        
        var tripDataPromise = $http
        .get('http://localhost:8080/trips/'+tripId, {
            "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY'
        })
        .then(function (response) {
            self.tripData = response.data;
        })
        ;
        
        return Promise.all([passsengerDataPromise, tripDataPromise])
    }

    this.get = function () {
        return $http
        .get("http://localhost:8080/trips/1/get_passengers", {
            headers: {
                "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY'
            }
        }).then(function (response) {
            passengers = response.data;
            passengerbystops = _.groupBy(passengers,
                                psg => psg.boardStopId);

            });
        }

    this.getPassengers = function () {
        console.log(passengerbystops);
        return passengerbystops;
    }

    this.getstopid = function(id) {
        return $http
        .get("http://localhost:8080/stops/"+id, {
            headers: {
                "Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkcml2ZXJJZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTQ1NzM1MDExMX0.jvE5mtq-KYt8qlBjIxJhAFOMh1L85epXE8UA_-O3teY'
            }
        });
    }       
     
})

