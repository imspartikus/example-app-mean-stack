// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var queryCtrl = angular.module('queryCtrl', ['geolocation', 'gservice']);
queryCtrl.controller('queryCtrl', function($scope, $log, $http, $rootScope, AuthService, geolocation, gservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    $scope.postQuery = false;
    var queryBody = {};
    if (AuthService.getUserStatus()){
        console.log("QUERY map service is logged in = true");
        $scope.showMap =true;
        gservice.makeNewMap();
    }else{
        console.log("QUERY show map false");
        $scope.showMap =false;
    }
    //if you are loading query you best reload the map. 
    //gservice.mapResized();
    // Functions
    // ----------------------------------------------------------------------------

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){
        coords = {lat:data.coords.latitude, lon:data.coords.longitude};

        // Set the latitude and longitude equal to the HTML5 coordinates
        $scope.formData.longitude = parseFloat(coords.lon).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
    });

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){
        console.log("they clicked the map?");
        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
        });
    });
    //show all the stuff you got
    $scope.queryEverything = function(){
        queryBody = {};
        //null out the form
        $scope.formData.longitude = '';

        $scope.formData.latitude = '';
        $scope.formData.distance = '';
        $scope.formData.shipmentId = '';
        $scope.formData.transporterName = '';
        //call query points with an empty list
        $scope.queryPoints(queryBody);

    };
    // Take query parameters and incorporate into a JSON queryBody
    $scope.queryPoints = function(queryBodyParams){
        var drp = $('#daterange').data('daterangepicker');
        console.log("startdate:"+drp.startDate.format('MM/DD/YYYY h:mm A'));
        if (queryBodyParams==undefined|| queryBodyParams ==null){
            // Assemble Query Body
            queryBody = {
                longitude: parseFloat($scope.formData.longitude),
                latitude: parseFloat($scope.formData.latitude),
                distance: parseFloat($scope.formData.distance),
                beaconId: $scope.formData.shipmentId,
                phoneId: $scope.formData.transporterName,
                startDate: drp.startDate.format('MM/DD/YYYY h:mm A'),
                endDate: drp.endDate.format('MM/DD/YYYY h:mm A')
            };
        }

        console.log(queryBody);
        // Post the queryBody to the /query POST route to retrieve the filtered results
        $http.post('/query', queryBody)

            // Store the filtered results in queryResults
            .success(function(queryResults){

                console.log("QUERY back in the success!");
                if (queryResults!==undefined && queryResults!==null){

                    // Pass the filtered results to the Google Map Service and refresh the map
                    gservice.update(queryResults, true);
                }
                // Count the number of records retrieved for the panel-footer
                $scope.postQuery = true;
                $scope.queryCount = queryResults.length;
            })
            .error(function(queryResults){
                console.log('Error ' + queryResults);
            });

        $rootScope.$broadcast('NewQueryParams', queryBody);
    };
});

