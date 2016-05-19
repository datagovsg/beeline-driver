// Managing the token passed to the driver app
import jwt from "jsonwebtoken";
export default function() {
  var token = localStorage["token"];
  var decodedToken = token ? jwt.decode(token) : null;
  Object.defineProperty(this, "token", {
    get: () => { return token; },
    set: (newToken) => {
      token = newToken;
      decodedToken = jwt.decode(token);
      localStorage["token"] = token;
    }
  });
  this.get = (propertyName) => {
    return decodedToken[propertyName];
  }
}
