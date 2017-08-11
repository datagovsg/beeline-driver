import jwt from "jsonwebtoken";
import _ from "lodash";

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
      //to store phone no and show it in 'welcome..'
      self.phoneNo = number;
      window.localStorage["phoneNo"] = number;
      var driver = response.data.driver;
      return driver;
    })
    .catch((error)=>{
      self.phoneNo = null;
    });
  };

  this.getVehicle = async function (vehicleId) {
    try {
      var response = await BeelineService.request({
        method: "GET",
        url: "/vehicles/"+vehicleId
      });
      return response.data;
    } catch(error){
      return;
    }
  }

  //vehicle is property for driver (current using vehicle)
  this.getVehicleInfo = async function (reload) {
    if (!reload && self.vehicles !== undefined) {
      if (self.vehicle !== null
        && self.vehicle.id == window.localStorage["vehicleId"]){
          return self.vehicle;
      }
      else {
        self.vehicle = await this.getVehicle(window.localStorage["vehicleId"]);
      }
      return self.vehicle;
    }
    else {
      var response = await BeelineService.request({
        method: "GET",
        url: "/vehicles"
      });
      //sort vehicle by updatedAt in descending order
      self.vehicles =  _.sortBy(response.data, function(item){
          return item.updatedAt;
        }).reverse();

      if (self.vehicles.length > 0) {
        const matchingVehicle = window.localStorage.vehicleId
          ? self.vehicles.find(v => v.id.toString() === window.localStorage.vehicleId)
          : null;

        self.vehicle = matchingVehicle || self.vehicles[0];
      }
      else {
        self.vehicle = null;
      }

      return self.vehicle;
    }
  };

  this.updateVehicleNo = async function (newVehicleNo) {
    //check self.vehicles has this newVehileNo, if yes, update vehicleNo
    //if not, post a vehicle which belongs to this driver
    if (self.vehicles!==undefined){
      var index = _.findIndex(self.vehicles, function(item){
        return item.vehicleNumber == newVehicleNo
      });
      if (index != -1) {
        self.vehicle = self.vehicles[index];
        window.localStorage["vehicleId"] = self.vehicle.id;
        return true;
      }
    }
    return BeelineService.request({
      method: "POST",
      url: "/vehicles",
      data: {
        vehicleNumber: newVehicleNo
      }
    })
    .then(function(response){
      self.vehicle = response.data;
      window.localStorage["vehicleId"] = self.vehicle.id;
      self.vehicles.push(self.vehicle);
      return true;
    })
    .catch((error)=>{
      return false;
    });
  };

  this.getVehicleId = function(){
    var vehicleId = window.localStorage["vehicleId"]!==undefined ?
      window.localStorage["vehicleId"] : 0;
    return vehicleId;
  }

  this.verifySession = function () {
    return BeelineService.request({
      url: '/vehicles', //Just use vehicles to verify session
      method: 'GET'
    })
    .then(response => true, function(error) {
      if (error.status == 403 || error.status == 401) {
        TokenService.logout();
        return false;
      } else {
        throw error;
      }
    });
  };

}
