'use strict';

angular.module('myApp.driverservice', [

])

.service('DriverService', function ($http) {
    var driver;
    var sessionToken = localStorage['sessionToken'] || null;
    var self = this;

    this.get = function (id) {
      return this.beeline({
          method: 'GET',
          url: '/drivers/" + id'
      }).then(function (response) {
        self.driver = response.data;
      });
    };

    this.beeline = function(options) {
        options.url = 'http://staging.beeline.sg' + options.url;
        if (this.sessionToken) {
            options.headers = options.headers || {}
            options.headers.authorization = 'Bearer ' + this.sessionToken;
        }
        return $http(options);
    };

    this.sendTelephoneVerificationCode =  function(no){
        var self = this;
        return this.verificationCodePromise = this.beeline({
            method: 'POST',
            url: "/users/sendTelephoneVerification",
            data: {
                telephone: no
            }
        }).then(function(response){
            if (response){
                self.mobileNo = no;
                return "success";
            }
            else {
                return "failer";
            }
        })
    };

    this. verifyTelephone = function(code){
        return this.beeline({
            method: 'GET',
            url: '/users/verifyTelephone?' + querystring.stringify({
                telephone: '+65' + this.mobileNo,
                code: code,
            })
        })
        .then((response) => {
            localStorage['sessionToken'] = this.sessionToken = response.data.sessionToken;
            return true;
        });
    };

});
