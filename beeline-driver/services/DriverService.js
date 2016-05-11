import jwt from "jsonwebtoken";

export default function($http){
  var sessionToken = localStorage["sessionToken"];
  var self = this;
  var driverId;
  var driverCache = null;

  if (!localStorage["sessionToken"]){
    localStorage["sessionToken"] = sessionToken;
  }

  this.beeline = function(options) {
    options.url = "http://staging.beeline.sg" + options.url;
    if (sessionToken) {
      options.headers = options.headers || {};
      options.headers.authorization = "Bearer " + sessionToken;
    }
    return $http(options);
  };

  this.getDecodedToken = function() {
    var decodedToken = jwt.decode(localStorage["sessionToken"]); //e.g. {role: 'driver', driverId: 8, tripId: 145, transportCompanyId: "3", iat: 1461142038}
    if (decodedToken) {
      driverId = decodedToken.driverId;
      return decodedToken;
    }
  };

  this.getDriverInfo = function(ignoreCache) {
    if (driverCache && !ignoreCache) {
      return Promise.resolve(driverCache);
    }
    return this.beeline({
      method: "GET",
      url: "/drivers/" + driverId
    })
    .then((response) => {
      driverCache = response.data;
      return driverCache;
    });
  };

  this.getVehicleInfo = function () {
    if (typeof(driverId)==="undefined") {
      driverId = self.getDecodedToken().driverId;
    }
    if (typeof(self.vehicle)!="undefined"){
      return Promise.resolve(self.vehicle);
    }
    else return this.beeline({
      method: "GET",
      url: "/vehicles"
    }).then(function (response) {
      self.vehicle = response.data;
      return response.data[0];
    });
  };

  this.assignReplacementDriver = function (tripId, replaceTelephone) {
    return this.beeline({
      method: "POST",
      url: "/trips/" + tripId + "/send_to_phone",
      data: {
        telephone: "+65"+replaceTelephone
      }
    })
    .then(function(response){
      return true;
    });
  };

  this.updateDriverName = function (newName) {
    if (typeof(driverId)==="undefined") {
      driverId = self.getDecodedToken().driverId;
    }
    return this.beeline({
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

  this.updateDriverPhone = function (newPhoneNo) {
    if (typeof(driverId)==="undefined") {
      driverId = self.getDecodedToken().driverId;
    }
    return this.beeline({
      method: "PUT",
      url: "/drivers/"+driverId,
      data: {
        telephone: newPhoneNo
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
    return this.beeline({
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
