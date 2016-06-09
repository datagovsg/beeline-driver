export default function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  // entry point starting url received from sms
  .state("login", {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginController"

  })
  .state("sms", {
    url: "/login/:phoneNo",
    templateUrl: "templates/SMS.html",
    controller: "LoginController"
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
  .state("app.start", {
    url: "/start/:tripId",
    views: {
      "menu-content": {
        templateUrl: "templates/start.html",
        controller: "StartController"
      }
    },
    data: {
      sendPings: true,
    }
  })
  .state("app.passengerList", {
    url: "/start/:stopId",
    views: {
      "menu-content": {
        templateUrl: "templates/passenger-list.html",
        controller: "PassengerListController"
      }
    },
    data: {
      sendPings: true,
    }
  })
  .state("app.cancel", {
    url: "/cancel",
    views: {
      "menu-content": {
        templateUrl: "templates/cancel.html",
        controller: "CancelController"
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  if (window.localStorage['sessionToken'] && window.localStorage['sessionToken'] != null) {
    $urlRouterProvider.otherwise('/app/route');
  } else {
    $urlRouterProvider.otherwise('/login');
  }
}
