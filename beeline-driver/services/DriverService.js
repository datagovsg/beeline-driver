export default function(TokenService, BeelineService) {
  var self = this;
  var driverId;
  var driverCache = null;

  this.getDriverInfo = function(ignoreCache) {
    if (driverCache && !ignoreCache) {
      return Promise.resolve(driverCache);
    }
    if (typeof(driverId)==="undefined") {
      driverId = TokenService.get("driverId");
    }
    return BeelineService.request({
      method: "GET",
      url: "/drivers/" + driverId
    })
    .then((response) => {
      driverCache = response.data;
      return driverCache;
    });
  };

  this.getVehicleInfo = function () {
    if (typeof(self.vehicle) != "undefined"){
      return Promise.resolve(self.vehicle);
    }
    else {

      return BeelineService.request({
        method: "GET",
        url: "/vehicles"
      }).then(function (response) {
        if (response.data.length == 0) {
          // Create a vehicle if it has not been created before
          return BeelineService.request({
            method: 'POST',
            url: '/vehicles',
            data: {
              vehicleNumber: 'SJKXXXXL'
            }
          })
          .then((response) => {
            self.vehicle = response.data
            return response.data
          })
        }
        else {
          self.vehicle = response.data[0];
          return response.data[0];
        }
      });
    }
  };

  this.assignReplacementDriver = function (tripId, replaceTelephone) {
    return BeelineService.request({
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
      driverId = TokenService.get("driverId");
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

  this.updateDriverPhone = function (newPhoneNo) {
    if (typeof(driverId)==="undefined") {
      driverId = TokenService.get("driverId");
    }
    return BeelineService.request({
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
