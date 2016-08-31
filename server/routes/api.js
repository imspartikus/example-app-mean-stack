var express         = require('express');
var router          = express.Router();
var passport        = require('passport');
var Point           = require('../models/point.js');
var User            = require('../models/user.js');
var UserKey         = require('../models/userKey.js');
var Beacon          = require('../models/beacon.js');


// POST Routes
// --------------------------------------------------------
//for finding the points
router.post('/phone/', function (req,res) {
    console.log("in the phone post method");
    var newPoint = new Point(req.body);
    console.log(newPoint);
    
    // //save the Beacon separately from the point, if there are beacons
    // if (newPoint.beaconArray!==undefined && newPoint.beaconArray!==null){
      
    //   for (var i = 0; i < newPoint.beaconArray.length; i++) {
        
    //     var beaconBody = {beaconId:newPoint.beaconArray[i],
    //       phoneId:newPoint.phoneId
    //     }
    //     var newBeacon = new Beacon(beaconBody);
    //     newBeacon.save(function(err){
    //       if (err) { 
    //           handleError(res, err);
    //       } else {
    //           console.log("I love beacons");
    //       }
    //     });
    //   };
    // }
    
    // New Point is saved in the db.
    newPoint.save(function(err){
        if (err) { 
            handleError(res, err);
        } else {
            res.send(newPoint);
        }
    });
});

function handleError(response, error){
  console.log("Error "+error);
}

//This is where we run the query to find points to put on the map
router.post('/query/', function(req, res){

    // Grab all of the query parameters from the body.
    var lat             = req.body.latitude;
    var lon             = req.body.longitude;
    var distance        = req.body.distance;
    var beaconId        = req.body.beaconId;
    var phoneId         = req.body.phoneId;
    var startDate       = req.body.startDate;
    var endDate         = req.body.endDate;

    // Opens a generic Mongoose Query. Depending on the post body we will...
    //var query = Point.find({});
    var query = Point.find();
    console.log("going into query");
    console.log("distance:"+distance);
    // ...include filter by Max Distance (converting miles to meters)
    if(distance && lon  && lat){
        console.log("in distance lon:"+lon+",lat:"+lat+",distance:"+distance);
        // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
        query = query.where('location').near({ center: {type: 'Point', coordinates: [lon, lat]},
            //TODO do I need this?
            // Converting meters to miles. Specifying spherical geometry (for globe)
            maxDistance: distance * 1609.34, spherical: true});

    }

    // ...include filter beacon Id
    if(beaconId){
      console.log("beaconId"+beaconId);
       // query = query.where('beaconId').equals(beaconId);
      query.find( { beaconArray:  beaconId } )
    }
    if(phoneId){
      console.log("phone id "+phoneId);
        query = query.where('phoneId').equals(phoneId);
    }
    console.log("going into query"+query);
    // Execute Query and Return the Query Results
    query.exec(function(err, allThePoints){
        if(err){
            console.log("error querying points")
            res.send(err);
        }
        // If no errors, respond with a JSON of all users that meet the criteria
        console.log("query all good"+allThePoints.length);
        res.json(allThePoints);
    });
});

//to register a new user
router.post('/register', function(req, res) {
  //ok so to keep any joker from registering we need to authenticate thier key
  if (req.body.userkey!==undefined){
    //UserKey has to be entered by hand to initialize the database
    UserKey.find({ userkey:req.body.userkey}, function (error, foundUserKey){
      if (error){
        console.log("no user found:"+error);
      }
      console.log("found user key:"+foundUserKey);
      if (foundUserKey!=undefined && foundUserKey.length>0 && foundUserKey[0].userkey!=undefined){
          console.log("registering a user...");
          User.register(new User({ username: req.body.username }),
            req.body.password, function(err, account) {
            if (err) {
              return res.status(500).json({
                err: err
              });
            }
            passport.authenticate('local')(req, res, function () {
              return res.status(200).json({
                status: 'Registration successful!'
              });
            });
          });
        }else{
          console.log("Problem finding this user key in the db: "+req.body.userkey);
          return res.status(500).json({err: { message: "Please enter a valid user key"}});
        }
    });
  }else{
    console.log("they never entered a user key");
    return res.status(500).json({err: { message: "Please enter a valid user key"}});
  }
  
});

//to login
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

//to logout
router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

//get user status - like are they logged in?
router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});


module.exports = router;