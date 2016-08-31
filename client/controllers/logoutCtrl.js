// Creates the logoutCtrl Module and Controller. 
var logoutCtrl = angular.module('logoutCtrl', []);
logoutCtrl.controller('logoutCtrl', function($scope, $location, AuthService){

    $scope.logout = function () {
      console.log("log out controller yo");
      // call logout from service
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });

    };

});

