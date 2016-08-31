// dependencies
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;

var express         = require('express');
var mongoose        = require('mongoose');
var port            = process.env.PORT || 8043;
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var app             = express();
var https           = require('https');
var fs              = require('fs');
var path            = require('path');

//for certs
var server;
var options = {
      key: fs.readFileSync(path.join(__dirname, 'certs', 'server', 'privkey.pem'))
    , cert: fs.readFileSync(path.join(__dirname, 'certs', 'server', 'fullchain.pem'))
    };

// mongoose
mongoose.connect('mongodb://localhost/theShepardApp'); // connect to our database

// user schema/model
var User = require('./models/user.js');

// create instance of express
var app = express();

// require routes
var routes = require('./routes/api.js');



// define middleware
app.use(express.static(path.join(__dirname, '../client')));     // sets the static files location to client
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser());                                          // get information from html forms
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({ extended: false }));            // parse application/x-www-form-urlencoded
app.use(cookieParser());                                        // read cookies (needed for auth)
app.use(require('express-session')({
    secret: 'areyoulookingdoyouseeit',
    resave: false,
    saveUninitialized: false
}));                                                             //session passport defs
app.use(passport.initialize());                                  //session passport defs
app.use(passport.session());                                     //session passport defs
app.use(express.static(path.join(__dirname, 'public')));         // sets the static files location to public
app.use('/bower_components',  express.static(__dirname + '/bower_components')); // Use BowerComponents

// configure passport
passport.use(new localStrategy(User.authenticate()));           //session passport defs
passport.serializeUser(User.serializeUser());                   //session passport defs
passport.deserializeUser(User.deserializeUser());                //session passport defs

// routes
//app.use('/user/', routes);
app.use('/', routes);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// error hndlers
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }));
});

module.exports = app;

server = https.createServer(options, app).listen(port, function () {
  port = server.address().port;
  console.log('Listening on https://' + server.address().address + ':' + port);
});