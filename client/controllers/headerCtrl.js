// Create the headerCtrl module and controller. Note that it depends on $location service
var headerCtrl = angular.module('headerCtrl', []);
headerCtrl.controller('headerCtrl', function($scope, $location, AuthService) {

    // Sets the isActive value based on the current URL location
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.logout = function () {
      console.log("log out yo");
      // call logout from service
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });

    };

    $scope.image = [{
    	header: 'img/GeoShepard-Logo.jpg',
    	src: 'img/red-dot.png'
  	}];
});