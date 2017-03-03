// Managing the token passed to the driver app
import jwt from "jsonwebtoken";
export default function() {
  var token = localStorage["sessionToken"];
  var decodedToken = token ? jwt.decode(token) : null;
  //FIXME old token need to removed no cache!
  Object.defineProperty(this, "token", {
    get: () => { return token; },
    set: (newToken) => {
      token = newToken;
      decodedToken = jwt.decode(token);
      localStorage["sessionToken"] = token;
    }
  });
  this.get = (propertyName) => {
    return decodedToken[propertyName];
  };
  this.logout = function () {
    // Set token to null via previously defined property,
    // ie, this.token
    this.token = null;
    window.localStorage.removeItem('sessionToken');
    window.localStorage.removeItem('vehicleId');
    window.localStorage.removeItem('phoneNo');
  };
}
