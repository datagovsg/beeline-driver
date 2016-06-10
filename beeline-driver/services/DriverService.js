import jwt from "jsonwebtoken";

export default function($http, BeelineService, TokenService){
  var self = this;
  var driverId;

  // Requests a verification code to be sent to a mobile number
  // Verification code is used to log in
  this.sendTelephoneVerificationCode = function(number) {
    return BeelineService.request({
      method: 'POST',
      url: '/drivers/sendTelephoneVerification',
      data: {
        telephone: '+65' + number
      },
    }).then(function() {
      return true;
    });
  };

  // Submit the received code and number for verification to the server
  this.verifyTelephone = function(number, code) {
    return BeelineService.request({
      method: 'POST',
      url: '/drivers/verifyTelephone',
      data: {
        telephone: '+65' + number,
        code: code
      }
    })
    .then(function(response) {
      TokenService.token = response.data.sessionToken;
      var driver = response.data.driver;
      window.localStorage.setItem('beelineDriver', JSON.stringify(driver));
      return driver;
    });
  };

  this.getDecodedToken = function() {
    //phone no. company id
    var decodedToken = jwt.decode(localStorage["sessionToken"]); //e.g. {role: 'driver', driverId: 8, tripId: 145, transportCompanyId: "3", iat: 1461142038}
    if (decodedToken) {
      driverId = decodedToken.driverId;
      return decodedToken;
    }
  };

  this.getDriverInfo = function () {
    if (typeof(driverId)==="undefined") {
      self.getDecodedToken();
    }
    if (typeof(self.driver)!="undefined"){
      return Promise.resolve(self.driver);
    }
    else return BeelineService.request({
      method: "GET",
      url: "/drivers/" + driverId
    }).then(function (response) {
      self.driver = response.data;
      return response.data;
    });
  };

  //vehicle is property for driver (current using vehicle)
  this.getVehicleInfo = function () {
    if (typeof(driverId)==="undefined") {
      driverId = self.getDecodedToken().driverId;
    }
    if (typeof(self.vehicle)!="undefined"){
      return Promise.resolve(self.vehicle);
    }
    else return BeelineService.request({
      method: "GET",
      url: "/vehicles"
    }).then(function (response) {
      self.vehicle = response.data;
      return response.data[0];
    });
  };

  this.updateDriverName = function (newName) {
    if (typeof(driverId)==="undefined") {
      driverId = self.getDecodedToken().driverId;
    }
    return BeelineService.request({
      method: "PUT",
      url: "/drivers/"+driverId,
      data: {
        name: newName
      }
    })
    .then(function(response){
      return true;
    });
  };

  this.updateVehicleNo = async function (newVehileNo) {
    if (typeof(self.vehicle)==="undefined"){
      await this.getVehicleInfo();
    }
    return BeelineService.request({
      method: "PUT",
      url: "/vehicles/"+self.vehicle[0].id,
      data: {
        vehicleNumber: newVehileNo
      }
    })
    .then(function(response){
      return true;
    });
  };
}
