export default function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  // entry point starting url received from sms
  .state("login", {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginController"

  })
  .state("loginVerification", {
    url: "/login/:phoneNo",
    templateUrl: "templates/sms.html",
    controller: "SmsController"
  })
  .state("app", {
    url: "/app",
    abstract: true,
    templateUrl: "templates/sidebar.html",
    controller: "SidebarController"
  })
  .state("app.route", {
    url: "/route",
    views: {
      "menu-content": {
        templateUrl: "templates/choose-route.html",
        controller: "RouteController"
      }
    }
  })
  .state("start", {
    url: "/start/:routeId/:tripId",
    templateUrl: "templates/start.html",
    controller: "StartController",
    data: {
      sendPings: true,
    }
  })
  .state("cancel", {
    url: "/cancel/:routeId/:tripId",
    templateUrl: "templates/cancel.html",
    controller: "CancelController",
  });
  // if none of the above states are matched, use this as the fallback
  if (window.localStorage['sessionToken'] && window.localStorage['sessionToken'] != null) {
    $urlRouterProvider.otherwise('/app/route');
  } else {
    $urlRouterProvider.otherwise('/login');
  }
}
