// Creates the Poll and Controller.

var pollCtrl = angular.module('pollCtrl', ['gservice']);

pollCtrl.controller('pollCtrl', function($scope, $timeout, $http, AuthService, gservice) {
    //boot this at some point using it for testing now.
    $scope.value = 1;
    
    //listen for new params
    $scope.$on('NewQueryParams', function (event, arg) { 
        console.log("They updated the query params"+ arg);
        $scope.queryBody =  arg;
    });

    var poll = function() {

        // Assemble Query Body
        queryBody={};
        if ($scope.queryBody!=undefined && $scope.queryBody!=null){
            queryBody = $scope.queryBody;
        }
        console.log("post up:"+queryBody.phoneId);
        if (AuthService.isLoggedIn()){
            console.log("poll service is logged in = true");
            // Post the queryBody to the /query POST route to retrieve the filtered results
            $http.post('/query', queryBody)

                // Store the filtered results in queryResults
                .success(function(queryResults){
                    console.log("these be me query res:"+queryResults.length);
                    // Pass the filtered results to the Google Map Service and update the map - refresh does the whole map - update just partially
                    //var resJson = JSON.parse(queryResults);
                    //console.log("res:"+resJson);
                    gservice.update(queryResults,false);
                    // Count the number of records retrieved for the panel-footer
                    $scope.queryCount = queryResults.length;
                })
                .error(function(queryResults){
                    console.log('Error ' + queryResults);
                });
        
        }else{
                console.log("not logged in yet...");
                    
        }
        
        $timeout(function() {
            $scope.value++;
            poll();
        }, 6000);
    };     
   poll();
});

pollCtrl.directive('chart', function() {
    return {
        restrict: 'A',
        scope : {
            value : '='  // '=' indicates 2 way binding
        },
        template : "<div> value : {{value}} </div>"
    };
});