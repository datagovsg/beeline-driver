import jwt from 'jsonwebtoken';

export default function($http){
  var driver;
  var sessionToken = localStorage['sessionToken'] || null;
  var self = this;
  var driverId;

  this.beeline = function(options) {
    options.url = 'http://staging.beeline.sg' + options.url;
    if (sessionToken) {
      options.headers = options.headers || {}
      options.headers.authorization = 'Bearer ' + sessionToken;
    }
    return $http(options);
  };

  this.getDecodedToken = function() {
    //HARDCODE testing token - the token should be taken from the URL
    localStorage['sessionToken'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZHJpdmVyIiwiZHJpdmVySWQiOjgsInRyaXBJZCI6MTQ1LCJ0cmFuc3BvcnRDb21wYW55SWQiOiIzIiwiaWF0IjoxNDYxMTQzMzI2fQ.XyaLl0rkYWF6XI_AOxFQNB0QNq0_v-EN-bS-TWX-Pdk';

    var decodedToken = jwt.decode(localStorage['sessionToken']); //e.g. {role: 'driver', driverId: 8, tripId: 145, transportCompanyId: "3", iat: 1461142038}
    driverId = decodedToken.driverId;
    return decodedToken;
  };

  this.getDriverInfo = function () {
    if (typeof(driverId)=='undefined') {
      self.getDecodedToken();
    }
    if (typeof(self.driver)!='undefined'){
      return Promise.resolve(self.driver);
    }
    else return this.beeline({
      method: 'GET',
      url: '/drivers/' + driverId,
    }).then(function (response) {
      self.driver = response.data;
    });
  };

  this.getVehicleInfo = function () {
    if (typeof(driverId)=='undefined') {
      driverId = self.getDecodedToken().driverId;
    }
    if (typeof(self.vehicle)!='undefined'){
      return Promise.resolve(self.vehicle);
    }
    else return this.beeline({
      method: 'GET',
      url: '/vehicles',
    }).then(function (response) {
      self.vehicle = response.data;
    });
  };

  this.assignReplacementDriver = function (tripId, replaceTelephone) {
    return this.beeline({
      method: 'GET',
      url: '/trips/' + tripId + '/send_to_phone',
      data: {
        id: tripId,
        telephone: '+65' + replaceTelephone
      },
    })
  };

  this.updateDriverName = function (newName) {
    if (typeof(driverId)=='undefined') {
      driverId = self.getDecodedToken().driverId;
    }
    return this.beeline({
      method: 'PUT',
      url: '/drivers/'+driverId,
      data: {
        name: newName
      }
    })
  };

  this.updateDriverPhone = function (newPhoneNo) {
    if (typeof(driverId)=='undefined') {
      driverId = self.getDecodedToken().driverId;
    }
    return this.beeline({
      method: 'PUT',
      url: '/drivers/'+driverId,
      data: {
        telephone: newPhoneNo
      }
    })
  };

  this.updateVehicleNo = function (newVehileNo) {
    if (typeof(self.vehicle)=='undefined'){
      this.getVehicleInfo();
    };
    return this.beeline({
      method: 'PUT',
      url: '/vehicles/'+self.vehicle.id,
      data: {
        vehicleNumber: newVehileNo
      }
    })
  };
}
