const env = require('../env.json')

// Wrapper for making requests to the beeline api
export default function($http, TokenService) {
  const sendRequestTo = (urlRoot) => function(options) {
    options.url = urlRoot + options.url;
    if (TokenService.token) {
      options.headers = options.headers || {};
      options.headers.Authorization = "Bearer " + TokenService.token;
    }
    return $http(options);
  }
  this.request = sendRequestTo(env.BACKEND_URL)
  this.tracking = sendRequestTo(env.TRACKING_URL)
}
