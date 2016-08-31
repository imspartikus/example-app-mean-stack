var myApp = angular.module('theShepardApp', ['ngRoute', 'loginCtrl','logoutCtrl','registerCtrl','queryCtrl', 'headerCtrl', 'pollCtrl', 'geolocation','gservice'])

myApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'queryCtrl',
      templateUrl: 'partials/queryForm.html',
      access: {restricted: true}
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'loginCtrl',
      access: {restricted: false}
    })
    .when('/logout', {
      controller: 'logoutCtrl',
      templateUrl:'partials/login.html',
      access: {restricted: false}
    })
    .when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'registerCtrl',
      access: {restricted: false}
    })
    .when('/query', {
      controller: 'queryCtrl',
      templateUrl: 'partials/queryForm.html',
      access: {restricted: true}
    })
    .when('/two', {
      template: '<h1>This is page two!</h1>',
      access: {restricted: false}
    })
    .otherwise({
      redirectTo: '/'
    });
});

myApp.run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getUserStatus()
      .then(function(){
        if ((next.access==undefined || next.access.restricted) && !AuthService.isLoggedIn()){
          $location.path('/login');
          $route.reload();
        }
      });
  });
});