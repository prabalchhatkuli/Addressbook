var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require("bcrypt");
var flash = require('connect-flash');
//----------------------------------------------------------------------------------------------------------
var mailerRouter = require('./routes/mailer.js');
var contactsRouter = require('./routes/contacts.js');
var dbRouter = require('./routes/database.js');
//-------------------------------------------------authentication & authorization----------------------------------------


var username = "cmps369";
var password = "finalproject";
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        password = hash;
        console.log("Hashed password = " + password);
    });
});

var routesConfig = require('./routes/mailer');

//---------------------------------------------------------------------------------------------------------------------------
dbRouter.startConnection(); // starts mongo db connection and continues listening

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //--changed to true
app.use(methodOverride()); //--added
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'cmps369'}));//added

//--------------------------------------------------authentication-------------------------------------------------
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },

    function(user, pswd, done) {
      console.log("Here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        if ( user != username ) {
            console.log("Username mismatch");
            return done(null, false);
        }

        bcrypt.compare(pswd, password, function(err, isMatch) {
            if (err) return done(err);
            if ( !isMatch ) {
                console.log("Password mismatch");
            }
            else {
                console.log("Valid credentials");
            }
            done(null, isMatch);
        });
      }
  ));

passport.serializeUser(function(username, done) {  
    console.log("serialize user called");    
    done(null, username);
});

passport.deserializeUser(function(username, done) { 
    console.log("Deserialize user called");    
    done(null, username);
 });
/*
 app.post('/login', function(req, res, next) {
  console.log(req.url);
  passport.authenticate('local', function(err, user, info) {
      console.log("authenticate");
      console.log(err);
      console.log(user);
      console.log(info);
  })(req, res, next);
});
*/

app.post('/login',
    passport.authenticate('local', { successRedirect: '/contacts',
                                     failureRedirect: '/login_fail',
                                  })
);


app.get('/login', function (req, res) {
res.render('login', {});
});

app.get('/login_fail', function (req, res) {
res.render('login_fail', {});
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

//-----------------------------------------------------------------------------------------------------------------
app.use('/', mailerRouter);
app.use('/contacts', contactsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
