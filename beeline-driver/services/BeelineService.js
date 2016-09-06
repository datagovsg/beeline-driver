const env = require('../env.json')

// Wrapper for making requests to the beeline api
export default function($http, TokenService) {
  this.request = function(options) {
    // options.url = "https://api.beeline.sg" + options.url;
    options.url = env.BACKEND_URL + options.url;
    // options.url="https://beeline-server-dev.herokuapp.com"+options.url;
    if (TokenService.token) {
      options.headers = options.headers || {};
      options.headers.Authorization = "Bearer " + TokenService.token;
    }
    return $http(options);
  };
}
