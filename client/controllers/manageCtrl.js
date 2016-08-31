// Creates the registerCtrl Module and Controller.
//They will need a userkey in a userkey table. 
var registerCtrl = angular.module('registerCtrl', []);
registerCtrl.controller('registerCtrl', function($scope, $location, AuthService){

    $scope.register = function () {
      console.log("Userkey:"+ $scope.registerForm.userkey);
      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.username, $scope.registerForm.password, $scope.registerForm.userkey)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function (myres) {
          $scope.error = true;
          if (myres!==undefined&& myres.err!==undefined){
            $scope.errorMessage = myres.err;
          }else{
            $scope.errorMessage = "Something went wrong!";
          }
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };

});
