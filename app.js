require('dotenv').load();
var express = require('express');
var passport = require('passport');
var setUpPassport = require('./setuppassport');

var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var logger = require('morgan');


var routes = require('./routes');

var app = express();

app.use(logger('short'));

var dbURI = 'mongodb://localhost:27017/express-test';
var databaseType = "LOCAL";
if (process.env.NODE_ENV === 'production') {
  databaseType = "REMOTE";
  dbURI = process.env.dbURI;
}
mongoose.connect(dbURI);
console.log("App server successfully connected to", databaseType, "Database server!");




setUpPassport();

//app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

module.exports = app;

//app.listen(app.get('port'), function(){
//  console.log('Server started on port ' + app.get('port'));
//});