// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Array of locations obtained from API calls
        var locations = [];

        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var currentSelectedMarker;

        // User Selected Location (initialize to D town)
        var selectedLat = 39.7392;
        var selectedLong = -104.9903;

        // Functions
        // --------------------------------------------------------------
        //make a new map
        googleMapService.makeNewMap = function(){
            
            //make a default location
            var myLatLon = {lat: selectedLat, lng: selectedLong};
            // Create a new map and place in the index.html page
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                center: myLatLon
            });
            $rootScope.map = map;
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                });
                 // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                //this is cool but annoying
                //map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");
                $rootScope.userMarker = marker;
            });
        };

        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            if (latitude!=undefined){
                selectedLat = latitude;
            }
            if (longitude!=undefined){
                selectedLong = longitude;
            }

            // If filtered results are provided in the refresh() call...
            if (filteredResults){

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {
console.log("in the else of the refresh");
                // Perform an AJAX call to get all of the records in the db.
                // $http.get('/query/').success(function(response){

                //     // Then convert the results into map points
                //     locations = convertToMapPoints(response);

                //     // Then initialize the map -- noting that no filter was used.
                //     initialize(latitude, longitude, false);
                // }).error(function(){});
            }
        };
        
        googleMapService.update = function(filteredResults, clearMarkers){        
            //did they click the map?  if so we should prolly hang on to that one
            var userMarker = $rootScope.userMarker;
            
            //Are there markers we already know about?
            var allMarkers = $rootScope.markers;
            if (allMarkers===undefined|| allMarkers==null){
                allMarkers = []
            }
            if (clearMarkers){
                //ok so they want us to start with a clean slate
                $rootScope.map=undefined;
            }
            //how bout a map?
            var map = $rootScope.map;
            // If map has not been created...
            if (!map){
                googleMapService.makeNewMap();
            }
            //put thier marker back on the map
            if (userMarker){
                userMarker.setMap(map);
            }

            //TODO use our own marker, we be hitting google on the slow
            //var iconRed = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
            var iconRed = "img/red-dot.png"
            if (filteredResults!=undefined){
                console.log("creating this many locations"+filteredResults.length)
                // Loop through each location in the array and place a marker
                for(var i= 0; i < filteredResults.length; i++) {
                    var tempLatLn = filteredResults[i].location;
                    var resLatLon = {lat: tempLatLn[1], lng: tempLatLn[0]};

                    
                   var marker = new google.maps.Marker({
                       position: resLatLon,
                       icon: iconRed
                   });
                   var contentString = '<p><b>Phone ID</b>: ' + filteredResults[i].phoneId+ 
                    '<br><b>beacon Ids</b>: ' + filteredResults[i].beaconArray+ 
                    '<br><b>Time</b>: ' + filteredResults[i].created_at+ '<br>';
                    // var popUp = new google.maps.InfoWindow({
                    //         content: contentString,
                    //         maxWidth: 320
                    //     });
                    // // For each marker created, add a listener that checks for clicks
                    // google.maps.event.addListener(marker, 'click', function(e){
                    //     console.log("todo add click event");
                    //     // When clicked, open the selected marker's message
                    //     currentSelectedMarker = filteredResults[i];
                    //     popUp.open(map, marker);
                    // });
                    addInfoWindow(marker, contentString);
                    marker.setMap(map);
                    allMarkers.push(marker);
                    //console.log("created marker");

                };//end for loop
            }
        }
        //make a popup window
        function addInfoWindow(marker, message) {

            var infoWindow = new google.maps.InfoWindow({
                content: message,
                maxWidth: 320
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
        }
        // Add a point to the map
//         googleMapService.addPointToMap = function(phoneId, lat, lon, beaconArray){
            
//             var popUp = '<p><b>Phone Id</b>: ' + phoneId + 
//                 '<br><b>Latitude</b>: ' + lat + '<br>' +
//                 '<b>Longitude</b>: ' + longitude + 
//                 '<br><b>GeoShepard Ids</b>: ';
//             for (var i=0; i<beaconArray.length; i++){
//                 popUp+= '<br>'+beaconArray[i];
//             };
//             popUp+='</p>';
            
//             //silly google is lon/lat
//             myNewPoint = new Point(
//                 new google.maps.LatLng(lon, lat),
//                     new google.maps.InfoWindow({
//                         content: popUp,
//                         maxWidth: 320
//                     }),
//                     phoneId, 
//                     beaconArray
//             );
// console.log("calling add single point to map");
//             addSinglePointToMap(myNewPoint);
//         }
//         // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString = '<p><b>Username</b>: ' + user.username + 
                '<br><b>Age</b>: ' + user.age + '<br>' +
                '<b>Gender</b>: ' + user.gender + 
                '<br><b>Favorite Language</b>: ' + user.favlang + '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note Lat, Lng format).
                locations.push(new Location(
                    new google.maps.LatLng(user.location[1], user.location[0]),
                    new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    user.username,
                    user.gender,
                    user.age,
                    user.favlang
                ))
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };
        // Constructor for generic point on map
        var Point = function(latlon, phoneId, beaconArray){
            this.latlon = latlon;
            this.phoneId = phoneId;
            this.beaconArray = beaconArray;
        };

        // Constructor for generic location
        var Location = function(latlon, message, username, gender, age, favlang){
            this.latlon = latlon;
            this.message = message;
            this.username = username;
            this.gender = gender;
            this.age = age;
            this.favlang = favlang
        };
        // // adds single point to map
        // var addSinglePointToMap = function(myPoint){
        //     // If map has not been created...
            
        //     if (!map){

        //         // Create a new map and place in the index.html page
        //         var map = new google.maps.Map(document.getElementById('map'), {
        //             zoom: 3,
        //             center: myPoint.latlon
        //         });
        //     }
        //     var icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        //     //create google style marker
        //     var marker = new google.maps.Marker({
        //            position: myPoint.latlon,
        //            map: map,
        //            title: "Big Map",
        //            icon: icon
        //        });

        //         // For each marker created, add a listener that checks for clicks
        //         google.maps.event.addListener(marker, 'click', function(e){
        //             // When clicked, open the selected marker's message
        //             currentSelectedMarker = n;
        //             n.message.open(map, marker);
        //         });
        // }


        // Initializes the map
        var initialize = function(latitude, longitude, filter) {
console.log("initialize is called");
            // Uses the selected lat, long as starting point
            var myLatLng = {lat: selectedLat, lng: selectedLong};
            var map = $rootScope.map;
            // If map has not been created...
            if (!map){

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 5,
                    center: myLatLng
                });
                $rootScope.map = map
            }

            // If a filter was used set the icons yellow, otherwise blue
            if(filter){
                icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            }
            else{
                icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function(n, i){
               var marker = new google.maps.Marker({
                   position: n.latlon,
                   map: map,
                   title: "Big Map",
                   icon: icon,
               });

                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function(e){

                    // When clicked, open the selected marker's message
                    currentSelectedMarker = n;
                    n.message.open(map, marker);
                });
            });

            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(latitude, longitude);
            var marker = new google.maps.Marker({
                position: initialLocation,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });

                // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });
        };

        // Refresh the page upon window load. Use the initial latitude and longitude
      //  google.maps.event.addDomListener(window, 'load',
      //      googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });

