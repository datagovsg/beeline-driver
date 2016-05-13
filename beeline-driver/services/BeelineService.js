// Wrapper for making requests to the beeline api
export default function($http, TokenService) {
  this.request = function(options) {
    options.url = "http://staging.beeline.sg" + options.url;
    if (TokenService.token) {
      options.headers = options.headers || {};
      options.headers.authorization = "Bearer " + TokenService.token;
    }
    return $http(options);
  };
};