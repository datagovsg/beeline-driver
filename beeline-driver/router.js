export default function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  // entry point starting url received from sms
  .state("launch", {
    url: "/launch/:tripToken",
    controller($state, $stateParams, TokenService) {
      TokenService.token = $stateParams.tripToken;
      $state.go("app.landing");
    }
  })
  .state("app", {
    url: "/app",
    abstract: true,
    templateUrl: "templates/emergency.html",
    controller: "JobEmergencyController"
  })
  .state("app.landing", {
    url: "/landing",
    views: {
      "menu-content": {
        templateUrl: "templates/landing.html",
        controller: "AppLandingController"
      }
    }
  })
  .state("app.jobAccept", {
    url: "/accept",
    views: {
      "menu-content": {
        templateUrl: "templates/accept.html",
        controller: "JobAcceptController"
      }
    }
  })
  .state("app.jobAccepted", {
    url: "/jobAccepted",
    views: {
      "menu-content": {
        templateUrl: "templates/job-accepted.html",
        controller: "JobAcceptedController"
      }
    }
  })
  .state("app.jobStarted", {
    url: "/jobStarted",
    views: {
      "menu-content": {
        templateUrl: "templates/job-started.html",
        controller: "JobStartedController"
      }
    }
  })
  .state("app.passengerList", {
    url: "/jobStarted/:stopId",
    views: {
      "menu-content": {
        templateUrl: "templates/passenger-list.html",
        controller: "PassengerListController"
      }
    }
  })
  .state("app.jobEnded", {
    url: "/jobEnded/:status?replacementPhoneNumber",
    views: {
      "menu-content": {
        templateUrl: "templates/job-ended.html",
        controller: "JobEndedController"
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise("/launch/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZHJpdmVyIiwiZHJpdmVySWQiOjgsInRyaXBJZCI6MTQ1LCJ0cmFuc3BvcnRDb21wYW55SWQiOiIzIiwiaWF0IjoxNDYxMTQzMzI2fQ.XyaLl0rkYWF6XI_AOxFQNB0QNq0_v-EN-bS-TWX-Pdk");
}
